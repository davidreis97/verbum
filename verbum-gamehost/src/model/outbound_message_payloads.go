package model

//ToStarting

type toStarting struct {
	Type string
}

func GenToStarting() toStarting {
	return toStarting{Type: "ToStarting"}
}

//PlayerEnter

type playerEnter struct {
	Type       string
	PlayerName string
	PlayerId   int32
}

func GenPlayerEnter(playerName string, playerId int32) playerEnter {
	return playerEnter{Type: "PlayerEnter", PlayerName: playerName, PlayerId: playerId}
}

//PlayerExit

type playerExit struct {
	Type     string
	PlayerId int32
}

func GenPlayerExit(playerId int32) playerExit {
	return playerExit{Type: "PlayerExit", PlayerId: playerId}
}

//ToOnGoing

type toOnGoing struct {
	Type    string
	Letters []rune
}

func GenToOnGoing(letters []rune) toOnGoing {
	return toOnGoing{Type: "ToOnGoing", Letters: letters}
}

//ScoreChange

type scoreChange struct {
	Type      string
	PlayerId  int32
	ScoreDiff int
}

func GenScoreChange(playerId int32, scoreDiff int) scoreChange {
	return scoreChange{Type: "ScoreChange", PlayerId: playerId, ScoreDiff: scoreDiff}
}

//ToFinished

type toFinished struct {
	Type string
}

func GenToFinished() toFinished {
	return toFinished{Type: "ToFinished"}
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
