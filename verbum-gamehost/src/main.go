package main

import (
	"context"
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/centrifugal/centrifuge"
	"github.com/davidreis97/verbum/verbum-gamehost/src/config"
	"github.com/davidreis97/verbum/verbum-gamehost/src/model"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/spf13/viper"
)

func handleLog(e centrifuge.LogEntry) {
	log.Printf("%s: %v", e.Message, e.Fields)
}

func handleConn(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h.ServeHTTP(w, r)
	})
}

func main() {

	// Initialize config

	config.InitializeDefaults()
	//config.save() // Uncomment to save default values to file (OVERWRITES EXISTING FILE)
	config.Load()
	config.Watch()

	// Initialize rand with time-based seed

	rand.Seed(time.Now().UnixNano())

	// Load Wordlist

	wordlist, err := model.Load(viper.GetString("wordlist"))

	if err != nil {
		log.Fatal(err)
	}

	// Setup Centrifuge

	node, err := centrifuge.New(centrifuge.Config{
		LogLevel:   centrifuge.LogLevelDebug,
		LogHandler: handleLog,
	})

	if err != nil {
		log.Fatal(err)
	}

	broker, _ := centrifuge.NewMemoryBroker(node, centrifuge.MemoryBrokerConfig{
		HistoryMetaTTL: 5 * time.Minute,
	})
	node.SetBroker(broker)

	roomManager := model.NewRoomManager(node, wordlist)

	node.OnConnecting(func(ctx context.Context, evt centrifuge.ConnectEvent) (centrifuge.ConnectReply, error) {
		if len(evt.Name) < 0 || len(evt.Name) > 20 {
			return centrifuge.ConnectReply{}, centrifuge.ErrorBadRequest
		}

		return centrifuge.ConnectReply{
			Credentials: &centrifuge.Credentials{
				UserID: evt.Name,
			},
		}, nil
	})

	node.OnConnect(func(client *centrifuge.Client) {
		var room *model.Room

		client.OnSubscribe(func(e centrifuge.SubscribeEvent, cb centrifuge.SubscribeCallback) {
			roomID := e.Channel

			room = roomManager.GetRoom(roomID)

			if room == nil {
				cb(centrifuge.SubscribeReply{}, centrifuge.ErrorNotAvailable)
				return
			}

			wordsSoFar, err := room.AddPlayer(client.UserID())

			if err != nil {
				room = nil
				cb(centrifuge.SubscribeReply{}, centrifuge.ErrorLimitExceeded)
				return
			}

			//Should move this logic to the Room file at some point
			if wordsSoFar != nil && len(wordsSoFar) > 0 {
				jsonMessage, err := json.Marshal(model.GenWordsSoFar(wordsSoFar))
				if err == nil { //This is best effort, no worries if the client misses it. However, we should log something if this fails.
					client.Send(jsonMessage)
				}
			}

			cb(centrifuge.SubscribeReply{Options: centrifuge.SubscribeOptions{Position: true, Recover: true, RecoverSince: &centrifuge.StreamPosition{Offset: 0}}}, nil)
		})

		client.OnHistory(func(e centrifuge.HistoryEvent, cb centrifuge.HistoryCallback) {
			cb(centrifuge.HistoryReply{}, nil)
		})

		client.OnPublish(func(e centrifuge.PublishEvent, cb centrifuge.PublishCallback) {
			cb(centrifuge.PublishReply{}, centrifuge.ErrorBadRequest)
		})

		client.OnRPC(func(e centrifuge.RPCEvent, cb centrifuge.RPCCallback) {
			if room == nil {
				cb(centrifuge.RPCReply{}, centrifuge.ErrorNotAvailable)
				return
			}

			if e.Method == "WordAttempt" {
				cb(*room.ProcessWordAttempt(&e.Data, client.UserID()), nil)
				return
			}
			cb(centrifuge.RPCReply{}, centrifuge.ErrorMethodNotFound)
		})

		client.OnDisconnect(func(e centrifuge.DisconnectEvent) {
			if room == nil {
				return
			}

			room.DropPlayer(client.UserID())
		})
	})

	if err := node.Run(); err != nil {
		log.Fatal(err)
	}

	httpServer := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = viper.GetStringSlice("allowed_origins")
	config.AllowMethods = []string{"GET", "FETCH"}

	httpServer.Use(cors.New(config))

	httpServer.GET("/connection/websocket", gin.WrapH(handleConn(centrifuge.NewWebsocketHandler(node, centrifuge.WebsocketConfig{CheckOrigin: CheckOrigin}))))

	httpServer.GET("/matchmake", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"room": roomManager.GetNextRoom().Id,
		})
	})

	httpServer.GET("/metrics", prometheusHandler())

	httpServer.GET("/status", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "ok",
		})
	})

	tlsCert := viper.GetString("tls_cert")
	tlsKey := viper.GetString("tls_key")
	if len(tlsCert) > 0 && len(tlsKey) > 0 {
		log.Println("Running in HTTPS Mode")
		httpServer.RunTLS(viper.GetString("bind_address"), tlsCert, tlsKey)
	} else {
		log.Println("Running in HTTP (No TLS) Mode")
		httpServer.Run(viper.GetString("bind_address"))
	}
}

func prometheusHandler() gin.HandlerFunc {
	h := promhttp.Handler()

	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}

func CheckOrigin(r *http.Request) bool {
	if !Contains(viper.GetStringSlice("allowed_origins"), r.Host) {
		log.Printf("Received websocket connection from unknown host [%s]", r.Host)
	}
	return true
}

func Contains(s []string, str string) bool {
	for _, v := range s {
		if v == str {
			return true
		}
	}

	return false
}
