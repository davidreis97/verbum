package model

import (
	"encoding/json"
	"errors"
	"log"
	"math/rand"
	"sort"
	"strings"
	"time"
	"unsafe"

	"github.com/centrifugal/centrifuge"
)

const (
	STARTING_TIMER = 15
	ONGOING_TIMER  = 120
)

type GameState int32

const (
	Unstarted GameState = iota
	Starting
	OnGoing
	Finished
)

type Player struct {
	name           string
	score          int
	wordsAttempted map[string]bool
	connected      bool
}

type Room struct {
	node    *centrifuge.Node
	Id      string
	letters map[rune]bool
	state   GameState
	players map[string]*Player
}

func NewRoom(node *centrifuge.Node) *Room {
	r := new(Room)

	r.Id = RandStringBytesMaskImprSrcUnsafe(12)
	r.letters = make(map[rune]bool)
	r.letters['A'] = true
	r.letters['B'] = true
	r.letters['C'] = true
	r.letters['D'] = true
	r.letters['E'] = true
	r.letters['F'] = true
	r.state = Unstarted
	r.node = node
	r.players = make(map[string]*Player)

	log.Println("Created new unstarted room with id " + r.Id)

	return r
}

func (r *Room) ProcessWordAttempt(data *[]byte, player string, wordlist *[]string) *centrifuge.RPCReply {
	var attempt WordAttempt
	json.Unmarshal(*data, &attempt)
	valid, points := r.AttemptWord(player, attempt.Word, wordlist)

	if valid {
		r.AddPoints(player, points)
		payload, _ := json.Marshal(GenWordApproved(points))
		return &centrifuge.RPCReply{Data: payload}
	} else {
		payload, _ := json.Marshal(GenWordRejected())
		return &centrifuge.RPCReply{Data: payload}
	}
}

func (r *Room) AttemptWord(player string, word string, wordlist *[]string) (bool, int) {
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

	if _, hasPlayed := r.players[player].wordsAttempted[word]; hasPlayed {
		return false, 0 //Word has already been used by this player
	}
	r.players[player].wordsAttempted[word] = true

	wordScore := len(word)

	return true, wordScore
}

func (r *Room) AddPoints(player string, scoreDiff int) {
	r.players[player].score += scoreDiff

	r.BroadcastPayload(GenScoreChange(player, scoreDiff))
}

func (r *Room) AddPlayer(playerName string) error {
	p, playerAlreadyExists := r.players[playerName]

	if playerAlreadyExists {
		if p.connected {
			return errors.New("player_already_exists")
		} else {
			p.connected = true
		}
	} else {
		p = &Player{
			name:           playerName,
			score:          0,
			wordsAttempted: make(map[string]bool),
			connected:      true,
		}
	}

	r.players[playerName] = p

	r.BroadcastPayload(GenPlayerEnter(playerName))

	return nil
}

func (r *Room) DropPlayer(playerName string) {
	if p, exists := r.players[playerName]; exists {
		p.connected = false
		r.BroadcastPayload(GenPlayerExit(playerName))
	}
}

func (r *Room) BroadcastPayload(message interface{}) (*centrifuge.PublishResult, error) {
	jsonMessage, err := json.Marshal(message)
	if err != nil {
		return nil, err
	}
	log.Println("Sent " + string(jsonMessage) + " in room id " + r.Id)
	result, err := r.node.Publish(r.Id, jsonMessage, centrifuge.WithHistory(9999, 4*time.Minute))
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

const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
const (
	letterIdxBits = 6                    // 6 bits to represent a letter index
	letterIdxMask = 1<<letterIdxBits - 1 // All 1-bits, as many as letterIdxBits
	letterIdxMax  = 63 / letterIdxBits   // # of letter indices fitting in 63 bits
)

func RandStringBytesMaskImprSrcUnsafe(n int) string {
	b := make([]byte, n)
	// A src.Int63() generates 63 random bits, enough for letterIdxMax characters!
	for i, cache, remain := n-1, rand.Int63(), letterIdxMax; i >= 0; {
		if remain == 0 {
			cache, remain = rand.Int63(), letterIdxMax
		}
		if idx := int(cache & letterIdxMask); idx < len(letterBytes) {
			b[i] = letterBytes[idx]
			i--
		}
		cache >>= letterIdxBits
		remain--
	}

	return *(*string)(unsafe.Pointer(&b))
}
