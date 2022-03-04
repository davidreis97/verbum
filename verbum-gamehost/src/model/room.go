package model

import (
	"encoding/json"
	"log"
	"math/rand"
	"strconv"
	"time"

	"github.com/centrifugal/centrifuge"
)

const (
	STARTING_TIMER = 15
	ONGOING_TIMER  = 120
)

type GameState int64

const (
	Unstarted GameState = iota
	Starting
	OnGoing
	Finished
)

type Player struct {
	id    int64
	name  string
	score int
}

type Room struct {
	node    *centrifuge.Node // Useless having a ref to this in every Room - move to a global const
	id      int64
	letters []string
	state   GameState
	players map[int64]Player
}

func NewRoom(node *centrifuge.Node) *Room {
	r := new(Room)

	r.id = rand.Int63()
	r.letters = []string{"A", "B", "C", "D", "E", "F"}
	r.state = Unstarted
	r.node = node

	log.Println("Created new unstarted room with id " + strconv.FormatInt(r.id, 10))

	return r
}

func (r *Room) AddPlayer(playerName string) {
	newPlayer := Player{
		id:    rand.Int63(),
		name:  playerName,
		score: 0,
	}

	r.players[newPlayer.id] = newPlayer

	r.SendGamePayload(GenPlayerEnter(newPlayer.name, newPlayer.id))
}

func (r *Room) DropPlayer(playerId int64) {
	delete(r.players, playerId)

	r.SendGamePayload(GenPlayerExit(playerId))
}

func (r *Room) SendGamePayload(message interface{}) (*centrifuge.PublishResult, error) {
	jsonMessage, err := json.Marshal(message)
	if err != nil {
		return nil, err
	}
	log.Println("Sent " + string(jsonMessage) + " in room id " + strconv.FormatInt(r.id, 10))
	result, err := r.node.Publish("room_"+strconv.FormatInt(r.id, 36), jsonMessage, centrifuge.WithHistory(10, time.Minute))
	return &result, err
}

func (r *Room) StartGame() {
	r.state = Starting
	_, err := r.SendGamePayload(GenToStarting())
	if err != nil {
		log.Println(err.Error())
		return
	}

	time.Sleep(STARTING_TIMER * time.Second)

	r.state = OnGoing
	_, err = r.SendGamePayload(GenToOnGoing(r.letters))
	if err != nil {
		log.Println(err.Error())
		return
	}

	log.Println("Game started in room id " + strconv.FormatInt(r.id, 10))

	time.Sleep(ONGOING_TIMER * time.Second)

	log.Println("Game ended in room id " + strconv.FormatInt(r.id, 10))

	r.state = OnGoing
	_, err = r.SendGamePayload(GenToFinished())
	if err != nil {
		log.Println(err.Error())
		return
	}
}
