package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/centrifugal/centrifuge"
	"github.com/davidreis97/verbum/verbum-gamehost/src/model"
)

func handler(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h.ServeHTTP(w, r)
	})
}

func main() {
	node, err := centrifuge.New(centrifuge.Config{})
	if err != nil {
		log.Fatal(err)
	}

	room := model.NewRoom(node)

	broker, _ := centrifuge.NewMemoryBroker(node, centrifuge.MemoryBrokerConfig{
		HistoryMetaTTL: 4 * time.Minute,
	})
	node.SetBroker(broker)

	node.OnConnecting(func(ctx context.Context, evt centrifuge.ConnectEvent) (centrifuge.ConnectReply, error) {
		return centrifuge.ConnectReply{
			Credentials: &centrifuge.Credentials{
				UserID: evt.Name,
			},
		}, nil
	})

	node.OnConnect(func(client *centrifuge.Client) {
		transportName := client.Transport().Name()
		transportProto := client.Transport().Protocol()
		log.Printf("client %s connected via %s (%s)", client.UserID(), transportName, transportProto)

		client.OnSubscribe(func(e centrifuge.SubscribeEvent, cb centrifuge.SubscribeCallback) {
			channelSplit := strings.Split(e.Channel, "_")
			if len(channelSplit) == 2 {
				_, err := strconv.Atoi(channelSplit[1])
				if err == nil {
					//TODO - Get the right game
					log.Printf("client subscribes on channel %s", e.Channel)
					cb(centrifuge.SubscribeReply{}, nil)
					room.AddPlayer(client.UserID())
					return
				}
			}

			log.Println("Bad game subscription - " + e.Channel)
			cb(centrifuge.SubscribeReply{}, errors.New("bad game subscription"))
		})

		client.OnHistory(func(e centrifuge.HistoryEvent, cb centrifuge.HistoryCallback) {
			if !client.IsSubscribed(e.Channel) {
				cb(centrifuge.HistoryReply{}, centrifuge.ErrorPermissionDenied)
				return
			}
			cb(centrifuge.HistoryReply{}, nil)
		})

		client.OnPublish(func(e centrifuge.PublishEvent, cb centrifuge.PublishCallback) {
			log.Printf("client publishes into channel %s: %s", e.Channel, string(e.Data))
			cb(centrifuge.PublishReply{}, nil)
		})

		client.OnDisconnect(func(e centrifuge.DisconnectEvent) {
			log.Printf("client %s disconnected", client.UserID())
		})
	})

	go room.StartGame()

	log.Println("After StartGame")

	if err := node.Run(); err != nil {
		log.Fatal(err)
	}

	wsHandler := centrifuge.NewWebsocketHandler(node, centrifuge.WebsocketConfig{CheckOrigin: CheckOrigin})
	http.Handle("/connection/websocket", handler(wsHandler))

	http.Handle("/", http.FileServer(http.Dir("./")))

	log.Printf("Starting server, visit http://localhost:8000")
	if err := http.ListenAndServe(":8000", nil); err != nil {
		log.Fatal(err)
	}
}

func CheckOrigin(r *http.Request) bool {
	fmt.Println("Received connection from " + r.Host)
	return true
}
