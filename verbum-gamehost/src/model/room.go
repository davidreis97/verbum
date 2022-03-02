package model

import (
	"log"
	"math/rand"
	"time"

	"github.com/centrifugal/centrifuge"
)

const (
	STARTING_TIMER = 15
)

type GameState int64

const (
	Unstarted GameState = iota
	Starting
	OnGoing
	Finished
)

type Message struct {
	Type    string
	Content string
}

type Room struct {
	node    *centrifuge.Node // Useless having a ref to this in every Room - move to a global const
	id      int64
	letters []string
	state   GameState
}

func NewRoom() *Room {
	room := new(Room)

	room.id = rand.Int63()
	room.letters = []string{"A", "B", "C", "D", "E", "F"}
	room.state = Unstarted

	return room
}

func (r *Room) SendGamePayload(messageType string, content string) (centrifuge.PublishResult, error) {
	return r.node.Publish("room_"+itoa(r.id), []byte(`{"type": "`+messageType+`"}`), centrifuge.WithHistory(10, time.Minute))
}

func (r *Room) ToStart() {
	r.state = Starting
	_, err := r.SendGamePayload("GameStarting", "")
	if err != nil {
		log.Println(err.Error())
	}
}
