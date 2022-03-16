package main

import (
	"bufio"
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/centrifugal/centrifuge"
	"github.com/davidreis97/verbum/verbum-gamehost/src/model"
	"github.com/gin-gonic/gin"
)

func handleLog(e centrifuge.LogEntry) {
	log.Printf("%s: %v", e.Message, e.Fields)
}

func handleConn(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("Here")
		h.ServeHTTP(w, r)
	})
}

func main() {

	// Load Wordlist

	wordlist, err := LoadWordlist("wordlist.txt")

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

	roomManager := model.NewRoomManager(node)

	node.OnConnecting(func(ctx context.Context, evt centrifuge.ConnectEvent) (centrifuge.ConnectReply, error) {
		return centrifuge.ConnectReply{
			Credentials: &centrifuge.Credentials{
				UserID: evt.Name,
			},
		}, nil
	})

	node.OnConnect(func(client *centrifuge.Client) {
		var clientId int64
		var room *model.Room

		client.OnSubscribe(func(e centrifuge.SubscribeEvent, cb centrifuge.SubscribeCallback) {
			roomID, err := strconv.ParseInt(e.Channel, 10, 64)

			if err != nil {
				cb(centrifuge.SubscribeReply{}, centrifuge.ErrorBadRequest)
				return
			}

			log.Printf("Subscription on room id %d", roomID)
			room = roomManager.GetRoom(roomID)

			if room == nil {
				cb(centrifuge.SubscribeReply{}, centrifuge.ErrorNotAvailable)
				return
			}

			clientId = room.AddPlayer(client.UserID())
			cb(centrifuge.SubscribeReply{Options: centrifuge.SubscribeOptions{Position: true, Recover: true, RecoverSince: &centrifuge.StreamPosition{Offset: 0}}}, nil)
		})

		client.OnHistory(func(e centrifuge.HistoryEvent, cb centrifuge.HistoryCallback) {
			if !client.IsSubscribed(e.Channel) {
				cb(centrifuge.HistoryReply{}, centrifuge.ErrorPermissionDenied)
				return
			}
			cb(centrifuge.HistoryReply{}, nil)
		})

		client.OnPublish(func(e centrifuge.PublishEvent, cb centrifuge.PublishCallback) {
			//log.Printf("client publishes into channel %s: %s", e.Channel, string(e.Data))
			log.Printf("Unexpected attempt to publish to channel %s: %s", e.Channel, string(e.Data))
			cb(centrifuge.PublishReply{}, centrifuge.ErrorBadRequest)
		})

		client.OnRPC(func(e centrifuge.RPCEvent, cb centrifuge.RPCCallback) {
			if room == nil {
				cb(centrifuge.RPCReply{}, centrifuge.ErrorNotAvailable)
				return
			}

			if e.Method == "WordAttempt" {
				cb(*room.ProcessWordAttempt(&e.Data, clientId, wordlist), nil)
				return
			}
			cb(centrifuge.RPCReply{}, centrifuge.ErrorMethodNotFound)
		})

		client.OnDisconnect(func(e centrifuge.DisconnectEvent) {
			if room == nil {
				return
			}

			room.DropPlayer(clientId)
		})
	})

	if err := node.Run(); err != nil {
		log.Fatal(err)
	}

	httpServer := gin.Default()

	httpServer.GET("/connection/websocket", gin.WrapH(handleConn(centrifuge.NewWebsocketHandler(node, centrifuge.WebsocketConfig{CheckOrigin: CheckOrigin}))))

	httpServer.GET("/matchmake", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"room": roomManager.GetNextRoom().Id,
		})
	})

	httpServer.GET("/status", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "ok",
		})
	})

	httpServer.Run()
}

func CheckOrigin(r *http.Request) bool {
	//fmt.Println("Received connection from " + r.Host)
	return true
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
