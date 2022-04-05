package model

import (
	"time"

	"github.com/spf13/viper"
)

//ToStarting

type toStarting struct {
	Type      string
	Timestamp int64
	Duration  int
}

func GenToStarting() toStarting {
	return toStarting{Type: "ToStarting", Timestamp: time.Now().Unix(), Duration: viper.GetInt("starting_timer")}
}

//PlayerEnter

type playerEnter struct {
	Type       string
	PlayerName string
}

func GenPlayerEnter(playerName string) playerEnter {
	return playerEnter{Type: "PlayerEnter", PlayerName: playerName}
}

//PlayerExit

type playerExit struct {
	Type       string
	PlayerName string
}

func GenPlayerExit(playerName string) playerExit {
	return playerExit{Type: "PlayerExit", PlayerName: playerName}
}

//ToOnGoing

type toOnGoing struct {
	Type      string
	Letters   []rune
	Timestamp int64
	Duration  int
}

func GenToOnGoing(letters []rune) toOnGoing {
	return toOnGoing{Type: "ToOnGoing", Letters: letters, Timestamp: time.Now().Unix(), Duration: viper.GetInt("ongoing_timer")}
}

//ScoreChange

type scoreChange struct {
	Type       string
	PlayerName string
	ScoreDiff  int
}

func GenScoreChange(playerName string, scoreDiff int) scoreChange {
	return scoreChange{Type: "ScoreChange", PlayerName: playerName, ScoreDiff: scoreDiff}
}

//ToFinished

type toFinished struct {
	Type        string
	Timestamp   int64
	Duration    int
	WordsPlayed map[string][]string
}

func GenToFinished(wordsPlayed map[string][]string) toFinished {
	return toFinished{Type: "ToFinished", Timestamp: time.Now().Unix(), Duration: viper.GetInt("finished_timer"), WordsPlayed: wordsPlayed}
}

//WordApproved

type wordApproved struct {
	Type      string
	ScoreDiff int
}

func GenWordApproved(scoreDiff int) wordApproved {
	return wordApproved{Type: "WordApproved", ScoreDiff: scoreDiff}
}

//WordRejected

type wordRejected struct {
	Type string
}

func GenWordRejected() wordRejected {
	return wordRejected{Type: "WordRejected"}
}

//WordsSoFar

type wordsSoFar struct {
	Type  string
	Words []string
}

func GenWordsSoFar(words []string) wordsSoFar {
	return wordsSoFar{Type: "WordsSoFar", Words: words}
}
