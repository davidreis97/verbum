package model

import "github.com/centrifugal/centrifuge"

type RoomManager struct {
	rooms    map[int64]*Room
	nextRoom *Room
	node     *centrifuge.Node
}

const (
	MAX_PLAYERS int = 10
)

func NewRoomManager(node *centrifuge.Node) *RoomManager {
	rm := new(RoomManager)
	rm.node = node
	rm.rooms = make(map[int64]*Room)
	return rm
}

func (rm *RoomManager) RemoveRoom(id int64) {
	delete(rm.rooms, id)
}

func (rm *RoomManager) GetNextRoom() *Room {
	if rm.nextRoom == nil || len(rm.nextRoom.players) >= MAX_PLAYERS {
		rm.nextRoom = NewRoom(rm.node)
		rm.rooms[rm.nextRoom.Id] = rm.nextRoom
		go rm.nextRoom.RunGame()
	}

	return rm.nextRoom
}

func (rm *RoomManager) GetRoom(id int64) *Room {
	return rm.rooms[id]
}
