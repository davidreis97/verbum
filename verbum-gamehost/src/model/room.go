package model

import (
	"encoding/json"
	"log"
	"math/rand"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/centrifugal/centrifuge"
)

const (
	STARTING_TIMER = 1
	ONGOING_TIMER  = 300
)

type GameState int64

const (
	Unstarted GameState = iota
	Starting
	OnGoing
	Finished
)

type Player struct {
	id             int64
	name           string
	score          int
	wordsAttempted map[string]bool
}

type Room struct {
	node    *centrifuge.Node
	Id      int64
	letters map[rune]bool
	state   GameState
	players map[int64]*Player
}

func NewRoom(node *centrifuge.Node) *Room {
	r := new(Room)

	r.Id = rand.Int63()
	r.letters = make(map[rune]bool)
	r.letters['A'] = true
	r.letters['B'] = true
	r.letters['C'] = true
	r.letters['D'] = true
	r.letters['E'] = true
	r.letters['F'] = true
	r.state = Unstarted
	r.node = node
	r.players = make(map[int64]*Player)

	log.Println("Created new unstarted room with id " + strconv.FormatInt(r.Id, 10))

	return r
}

func (r *Room) ProcessWordAttempt(data *[]byte, playerId int64, wordlist *[]string) *centrifuge.RPCReply {
	var attempt WordAttempt
	json.Unmarshal(*data, &attempt)
	valid, points := r.AttemptWord(playerId, attempt.Word, wordlist)

	if valid {
		r.AddPoints(playerId, points)
		payload, _ := json.Marshal(GenWordApproved(points))
		return &centrifuge.RPCReply{Data: payload}
	} else {
		payload, _ := json.Marshal(GenWordRejected())
		return &centrifuge.RPCReply{Data: payload}
	}
}

func (r *Room) AttemptWord(playerId int64, word string, wordlist *[]string) (bool, int) {
	for _, char := range word {
		_, isAcceptedChar := r.letters[char]

		if !isAcceptedChar {
			return false, 0
		}
	}

	i := sort.SearchStrings(*wordlist, strings.ToLower(word))

	if i < 0 || i >= len(*wordlist) || (*wordlist)[i] != strings.ToLower(word) {
		return false, 0 //Word is not valid english word
	}

	if _, hasPlayed := r.players[playerId].wordsAttempted[word]; hasPlayed {
		return false, 0 //Word has already been used by this player
	}
	r.players[playerId].wordsAttempted[word] = true

	wordScore := len(word)

	return true, wordScore
}

func (r *Room) AddPoints(playerId int64, scoreDiff int) {
	r.players[playerId].score += scoreDiff

	r.BroadcastPayload(GenScoreChange(playerId, scoreDiff))
}

func (r *Room) AddPlayer(playerName string) int64 {
	newPlayer := Player{
		id:             rand.Int63(),
		name:           playerName,
		score:          0,
		wordsAttempted: make(map[string]bool),
	}

	r.players[newPlayer.id] = &newPlayer

	r.BroadcastPayload(GenPlayerEnter(newPlayer.name, newPlayer.id))

	return newPlayer.id
}

func (r *Room) DropPlayer(playerId int64) {
	delete(r.players, playerId)

	r.BroadcastPayload(GenPlayerExit(playerId))
}

func (r *Room) BroadcastPayload(message interface{}) (*centrifuge.PublishResult, error) {
	jsonMessage, err := json.Marshal(message)
	if err != nil {
		return nil, err
	}
	log.Println("Sent " + string(jsonMessage) + " in room id " + strconv.FormatInt(r.Id, 10))
	result, err := r.node.Publish(strconv.FormatInt(r.Id, 36), jsonMessage, centrifuge.WithHistory(9999, 4*time.Minute))
	return &result, err
}

func (r *Room) RunGame() {
	r.state = Starting
	_, err := r.BroadcastPayload(GenToStarting())
	if err != nil {
		log.Println(err.Error())
		return
	}

	//log.Println("Game started in room id " + strconv.FormatInt(r.id, 10))

	time.Sleep(STARTING_TIMER * time.Second)

	r.state = OnGoing

	letters := make([]rune, len(r.letters))
	i := 0
	for k := range r.letters {
		letters[i] = k
		i++
	}
	_, err = r.BroadcastPayload(GenToOnGoing(letters))

	if err != nil {
		log.Println(err.Error())
		return
	}

	time.Sleep(ONGOING_TIMER * time.Second)

	r.state = Finished
	_, err = r.BroadcastPayload(GenToFinished())
	if err != nil {
		log.Println(err.Error())
		return
	}

	// TODO - CLEAN HISTORY IN ALL CHANNELS RELATED TO THIS GAME

	if len(r.players) > 0 {
		r.RunGame()
	}
}
