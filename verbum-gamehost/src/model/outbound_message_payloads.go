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
	Type    string
	Letters []rune
}

func GenToOnGoing(letters []rune) toOnGoing {
	return toOnGoing{Type: "ToOnGoing", Letters: letters}
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
