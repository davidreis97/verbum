# Endpoints

## Centrifuge

- PUB/SUB `room_<room_number>`
    - SUB side:
        - Receive live game information
        - Must have history or send entire state frequently enough (to get initial message)
    - PUB side:
        - Publish new words
        - Don't get published as is to the channel

# Entities

## Room

Has: 
- A room id
- The letters that are in play at that room
- The current state of the game ("Starting" | "OnGoing" | "Finished")
- Timers and callbacks to manage itself