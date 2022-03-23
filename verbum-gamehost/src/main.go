package main

import (
	"bufio"
	"context"
	"log"
	"math/rand"
	"net/http"
	"os"
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
	//config.save() // Uncomment to save default values to file (OVERWRITES EXISTING CONFIG)
	config.Load()
	config.Watch()

	// Initialize rand with time-based seed

	rand.Seed(time.Now().UnixNano())

	// Load Wordlist

	wordlist, err := LoadWordlist(viper.GetString("wordlist"))

	if err != nil {
		log.Fatal(err)
	}

	// Wordlist Grooming
	// sort.Strings(*wordlist)
	// SaveWordlist("wordlist3_groomed.txt", *wordlist)
	// os.Exit(0)

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

	roomManager := model.NewRoomManager(node)

	node.OnConnecting(func(ctx context.Context, evt centrifuge.ConnectEvent) (centrifuge.ConnectReply, error) {
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

			err = room.AddPlayer(client.UserID())

			if err != nil {
				room = nil
				cb(centrifuge.SubscribeReply{}, centrifuge.ErrorLimitExceeded)
				return
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
				cb(*room.ProcessWordAttempt(&e.Data, client.UserID(), wordlist), nil)
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

	tlsCert := viper.GetString("tlsCert")
	tlsKey := viper.GetString("tlsKey")
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

func LoadWordlist(path string) (*[]string, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var lines []string
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}
	return &lines, scanner.Err()
}

func SaveWordlist(path string, wordlist []string) {
	file, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)

	if err != nil {
		log.Fatalf("failed creating file: %s", err)
	}

	datawriter := bufio.NewWriter(file)

	for _, data := range wordlist {
		_, _ = datawriter.WriteString(data + "\n")
	}

	datawriter.Flush()
	file.Close()
}
