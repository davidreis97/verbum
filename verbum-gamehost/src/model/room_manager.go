package model

import (
	"github.com/centrifugal/centrifuge"
	"github.com/spf13/viper"
)

type RoomManager struct {
	rooms    map[string]*Room
	nextRoom *Room
	node     *centrifuge.Node
	wordList *WordList
}

func NewRoomManager(node *centrifuge.Node, wl *WordList) *RoomManager {
	rm := new(RoomManager)
	rm.node = node
	rm.rooms = make(map[string]*Room)
	rm.wordList = wl
	return rm
}

func (rm *RoomManager) RemoveRoom(id string) {
	delete(rm.rooms, id)
}

func (rm *RoomManager) StartRoomAndDispose(r *Room) {
	//It should be up to the manager whether the room should be restarted or not. Would avoid having to pass the entire wordlist here.
	rm.nextRoom.RunGame(rm.wordList)
	rm.RemoveRoom(r.Id)
	if r.Id == rm.nextRoom.Id {
		rm.nextRoom = nil
	}
}

// If there are no room, start a new room and set it as the next room.
// If there are rooms and one of them has less than the max players, set it as the next room.
// If there are rooms but all rooms are full, start a new room and set it as the next room.
func (rm *RoomManager) GetNextRoom() *Room {
	if rm.nextRoom == nil || len(rm.nextRoom.players) >= viper.GetInt("max_players") {
		for room := range rm.rooms {
			if len(rm.rooms[room].players) < viper.GetInt("max_players") {
				rm.nextRoom = rm.rooms[room]
				return rm.nextRoom
			}
		}

		rm.nextRoom = NewRoom(rm.node, rm.wordList)
		rm.rooms[rm.nextRoom.Id] = rm.nextRoom
		go rm.StartRoomAndDispose(rm.nextRoom)
	}

	return rm.nextRoom
}

func (rm *RoomManager) GetRoom(id string) *Room {
	return rm.rooms[id]
}
