//MESSAGING ENTITIES

export type ToStartingType = "ToStarting"
export type PlayerEnterType = "PlayerEnter"
export type PlayerExitType = "PlayerExit"
export type ToOnGoingType = "ToOnGoing"
export type ScoreChangeType = "ScoreChange"
export type ToFinishedType = "ToFinished"
export type WordApprovedType = "WordApproved"
export type WordRejectedType = "WordRejected"

export type MessageType = ToStartingType | PlayerEnterType | PlayerExitType | ToOnGoingType | ScoreChangeType | ToFinishedType | WordApprovedType | WordRejectedType

export interface ToStarting {
    Type: ToStartingType
}

export interface PlayerEnter {
    Type: PlayerEnterType,
    PlayerName: string,
    PlayerId: number
}

export interface PlayerExit {
    Type: PlayerExit,
    PlayerId: number
}

export interface ToOnGoing {
    Type: ToOnGoingType,
    Letters: number[]
}

export interface ScoreChange {
    Type: ScoreChangeType,
    PlayerId: number,
    ScoreDiff: number
}

export interface ToFinished {
    Type: ToFinishedType
}

export interface WordApproved {
    Type: WordApprovedType,
    ScoreDiff: number
}

export interface WordRejected {
    Type: WordRejectedType
}

// RPC WordAttempt

export interface WordAttempt {
    Word: string
}

//INTERNAL ENTITIES

export interface Player {
    id: number,
    name: string,
    score: number
}

export type GamePhase = "Connecting" | "Starting" | "OnGoing" | "Finished"