package logic

import (
	"encoding/json"
	"errors"
	"math/rand"
	"time"
	"unsafe"

	"github.com/centrifugal/centrifuge"
	"github.com/davidreis97/verbum/verbum-gamehost/src/log"
	"github.com/davidreis97/verbum/verbum-gamehost/src/messages"
	"github.com/spf13/viper"
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
	state   GameState
	players map[string]*Player
	wordSet *WordSet
}

func NewRoom(node *centrifuge.Node, wl *WordList) *Room {
	r := new(Room)

	r.Id = RandStringBytesMaskImprSrcUnsafe(12)
	r.RegenLetters(wl)
	r.state = Unstarted
	r.node = node
	r.players = make(map[string]*Player)

	log.Logger.Sugar().Debugw("Created new unstarted room", "roomId", r.Id)

	return r
}

func (r *Room) RegenLetters(wl *WordList) {
	r.wordSet = wl.GetRandomWordSet()
}

func (r *Room) ProcessWordAttempt(data *[]byte, player string) *centrifuge.RPCReply {
	var attempt messages.WordAttempt
	json.Unmarshal(*data, &attempt)
	valid, points := r.AttemptWord(player, attempt.Word)

	if valid {
		r.AddPoints(player, points)
		payload, _ := json.Marshal(messages.GenWordApproved(points))
		return &centrifuge.RPCReply{Data: payload}
	} else {
		payload, _ := json.Marshal(messages.GenWordRejected())
		return &centrifuge.RPCReply{Data: payload}
	}
}

func (r *Room) AttemptWord(player string, word string) (bool, int) {
	if !r.wordSet.IsValidWord(word) {
		return false, 0
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

	r.BroadcastPayload(messages.GenScoreChange(player, scoreDiff))
}

func (r *Room) AddPlayer(playerName string) ([]string, error) {
	p, playerAlreadyExists := r.players[playerName]

	var wordsSoFar []string = nil

	if playerAlreadyExists {
		if p.connected {
			return nil, errors.New("player_already_exists")
		} else {
			p.connected = true

			wordsSoFar = make([]string, len(p.wordsAttempted))

			i := 0
			for k := range p.wordsAttempted {
				wordsSoFar[i] = k
				i++
			}
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

	r.BroadcastPayload(messages.GenPlayerEnter(playerName))

	return wordsSoFar, nil
}

func (r *Room) DropPlayer(playerName string) {
	if p, exists := r.players[playerName]; exists {
		p.connected = false
		r.BroadcastPayload(messages.GenPlayerExit(playerName))
	}
}

func (r *Room) BroadcastPayload(message interface{}) (*centrifuge.PublishResult, error) {
	jsonMessage, err := json.Marshal(message)
	if err != nil {
		return nil, err
	}
	log.Logger.Sugar().Debugw("Sent message", "message", string(jsonMessage), "roomId", r.Id)
	result, err := r.node.Publish(r.Id, jsonMessage, centrifuge.WithHistory(9999, 4*time.Minute))
	return &result, err
}

func (r *Room) ResetPlayers() {
	for name, player := range r.players {
		player.wordsAttempted = make(map[string]bool)
		if !player.connected {
			delete(r.players, name)
		} else {
			player.score = 0
		}
	}
}

func (r *Room) GenerateWordsPlayed() map[string][]string {
	wordsPlayed := make(map[string][]string)

	for name, player := range r.players {
		playerWords := make([]string, len(player.wordsAttempted))
		i := 0
		for k := range player.wordsAttempted {
			playerWords[i] = k
			i++
		}
		wordsPlayed[name] = playerWords
	}

	return wordsPlayed
}

func (r *Room) RunGame(wl *WordList) {
	r.state = Starting
	_, err := r.BroadcastPayload(messages.GenToStarting())
	if err != nil {
		log.Logger.Error(err.Error())
		return
	}

	time.Sleep(viper.GetDuration("starting_timer") * time.Second)

	r.state = OnGoing

	_, err = r.BroadcastPayload(messages.GenToOnGoing([]rune(r.wordSet.LetterSet)))

	if err != nil {
		log.Logger.Error(err.Error())
		return
	}

	time.Sleep(viper.GetDuration("ongoing_timer") * time.Second)

	r.state = Finished
	_, err = r.BroadcastPayload(messages.GenToFinished(r.GenerateWordsPlayed()))
	if err != nil {
		log.Logger.Error(err.Error())
		return
	}

	time.Sleep(viper.GetDuration("finished_timer") * time.Second)

	// TODO - CLEAN HISTORY IN ALL CHANNELS RELATED TO THIS GAME
	// The above todo requires investigation - what happens if we resume subscription from id 40 and we only have 45 onwards?
	r.ResetPlayers()

	if len(r.players) > 0 {
		r.RegenLetters(wl)
		r.RunGame(wl)
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
