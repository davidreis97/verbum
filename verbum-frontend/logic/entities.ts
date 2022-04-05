//MESSAGING ENTITIES

export type ToStartingType = "ToStarting"
export type PlayerEnterType = "PlayerEnter"
export type PlayerExitType = "PlayerExit"
export type ToOnGoingType = "ToOnGoing"
export type ScoreChangeType = "ScoreChange"
export type ToFinishedType = "ToFinished"
export type WordApprovedType = "WordApproved"
export type WordRejectedType = "WordRejected"
export type WordsSoFarType = "WordsSoFar"

export type MessageType = ToStartingType | PlayerEnterType | PlayerExitType | ToOnGoingType | ScoreChangeType | ToFinishedType | WordApprovedType | WordRejectedType | WordsSoFarType

export interface ToStarting {
    Type: ToStartingType,
    Timestamp: number,
    Duration: number
}

export interface PlayerEnter {
    Type: PlayerEnterType,
    PlayerName: string
}

export interface PlayerExit {
    Type: PlayerExit,
    PlayerName: string
}

export interface ToOnGoing {
    Type: ToOnGoingType,
    Letters: number[],
    Timestamp: number,
    Duration: number
}

export interface ScoreChange {
    Type: ScoreChangeType,
    PlayerName: string,
    ScoreDiff: number
}

export interface ToFinished {
    Type: ToFinishedType,
    Timestamp: number,
    Duration: number,
    WordsPlayed: {[username: string]: string[]}
}

export interface WordApproved {
    Type: WordApprovedType,
    ScoreDiff: number
}

export interface WordRejected {
    Type: WordRejectedType
}

// Direct Messages

export interface WordsSoFar{
    Type: WordsSoFarType,
    Words: string[]
}

// RPC WordAttempt

export interface WordAttempt {
    Word: string
}

// HTTP Matchmake

export interface MatchmakeResponse {
    room: string
}

//INTERNAL ENTITIES

export interface Player {
    name: string,
    score: number,
    connected: boolean
}

export type GamePhase = "Connecting" | "Starting" | "OnGoing" | "Finished"

export enum Errors { NoUsername = "NoUsername", RoomUnavailable = "RoomUnavailable", UserAlreadyExists = "UserAlreadyExists" }