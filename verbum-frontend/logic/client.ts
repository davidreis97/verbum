import Centrifuge from "centrifuge";
import { WordAttempt } from "./entities";

class GameHostClient {
    centrifuge: Centrifuge;
    roomId: string;
    playerName: string;

    constructor(playerName: string, gameId: number){
        this.playerName = playerName;
        this.centrifuge = new Centrifuge('ws://localhost:8080/connection/websocket', {name: playerName});
        this.roomId = gameId.toString();
    }

    onConnect(handler: (...args: any[]) => void){
        this.centrifuge.on('connect', async (ctx) => {
            console.log('Connected over ' + ctx.transport);
            handler(ctx);
        });
    }

    onDisconnect(handler: (...args: any[]) => void){
        this.centrifuge.on('disconnect', function(ctx){
            console.log('Disconnected: ' + ctx.reason);
            handler(ctx);
        });
    }

    async attemptWord(word: string) : Promise<[boolean, number]>{
        var attempt: WordAttempt = {Word: word.toUpperCase()}

        try{
            var response = await this.centrifuge.namedRPC("WordAttempt", attempt)
            switch(response.data.Type){
                case null:
                case undefined:
                    console.log("Error parsing word attempt response: ", response);
                    return [false, 0];
                case "WordApproved":
                    return [true, response.data.ScoreDiff];
                case "WordRejected":
                    return [false, 0];
            }

            console.log("Error parsing word attempt response: ", response);
            return [false, 0];
        }catch(e){
            console.log("Failed to send word attempt: ", e);
            return [false, 0];
        }
    }

    hookGameCallbacks(handler: (...args: any[]) => void){
        //var client = this;

        this.centrifuge.subscribe(this.roomId, handler, {since: {offset: 0, epoch:""}}).on('subscribe', async (ctx) => {
            console.log("Subscribed to room " + this.roomId, ctx);
            if(ctx.recovered === false){
                console.warn("FAILED TO GET CLIENT UP TO DATE");
            }
            //console.log("History", await client.centrifuge.history(this.roomId, {limit: 1000}));
        });
    }

    connect(){
        this.centrifuge.connect();
    }

    isConnected(){
        return this.centrifuge.isConnected();
    }
}

export default GameHostClient;