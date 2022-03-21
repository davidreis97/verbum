package model

import (
	"github.com/centrifugal/centrifuge"
	"github.com/spf13/viper"
)

type RoomManager struct {
	rooms    map[string]*Room
	nextRoom *Room
	node     *centrifuge.Node
}

func NewRoomManager(node *centrifuge.Node) *RoomManager {
	rm := new(RoomManager)
	rm.node = node
	rm.rooms = make(map[string]*Room)
	return rm
}

func (rm *RoomManager) RemoveRoom(id string) {
	delete(rm.rooms, id)
}

func (rm *RoomManager) StartRoomAndDispose(r *Room) {
	rm.nextRoom.RunGame()
	rm.RemoveRoom(r.Id)
}

func (rm *RoomManager) GetNextRoom() *Room {
	if rm.nextRoom == nil ||
		len(rm.nextRoom.players) >= viper.GetInt("max_players") ||
		(rm.nextRoom.state != Unstarted && rm.nextRoom.state != Starting) {

		rm.nextRoom = NewRoom(rm.node)
		rm.rooms[rm.nextRoom.Id] = rm.nextRoom
		go rm.StartRoomAndDispose(rm.nextRoom)
	}

	return rm.nextRoom
}

func (rm *RoomManager) GetRoom(id string) *Room {
	return rm.rooms[id]
}
