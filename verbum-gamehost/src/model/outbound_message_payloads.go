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
	PlayerId   int64
}

func GenPlayerEnter(playerName string, playerId int64) playerEnter {
	return playerEnter{Type: "PlayerEnter", PlayerName: playerName, PlayerId: playerId}
}

//PlayerExit

type playerExit struct {
	Type     string
	PlayerId int64
}

func GenPlayerExit(playerId int64) playerExit {
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
	PlayerId  int64
	ScoreDiff int
}

func GenScoreChange(playerId int64, scoreDiff int) scoreChange {
	return scoreChange{Type: "ScoreChange", PlayerId: playerId, ScoreDiff: scoreDiff}
}

//ToFinished

type toFinished struct {
	Type string
}

func GenToFinished() toFinished {
	return toFinished{Type: "ToFinished"}
}
