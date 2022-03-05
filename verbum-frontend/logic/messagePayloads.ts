export type ToStartingType = "ToStarting"
export type PlayerEnterType = "PlayerEnter"
export type PlayerExitType = "PlayerExit"
export type ToOnGoingType = "ToOnGoing"
export type ScoreChangeType = "ScoreChange"
export type ToFinishedType = "ToFinished"

export type MessageType = ToStartingType | PlayerEnterType | PlayerExitType | ToOnGoingType | ScoreChangeType | ToFinishedType

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
    Letters: string[]
}

export interface ScoreChange {
    Type: ScoreChangeType,
    PlayerId: number,
    ScoreDiff: number
}

export interface ToFinished {
    Type: ToFinishedType
}