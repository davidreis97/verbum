import Centrifuge from "centrifuge";
import { WordAttempt } from "./entities";

class GameHostClient {
    centrifuge: Centrifuge;
    roomId: string;
    playerName: string;

    constructor(playerName: string, gameId: string){
        this.playerName = playerName;
        this.centrifuge = new Centrifuge('ws://localhost:8080/connection/websocket', {name: playerName});
        this.roomId = gameId;
    }

    onConnect(handler: (...args: any[]) => void){
        this.centrifuge.on('connect', async (ctx) => {
            console.log('Connected over ' + ctx.transport);
            handler(ctx);
            console.log(ctx);
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

    async hookGameCallbacks(handler: (ctx: any, isHistory: boolean) => void, historyDone: () => void){
        if(this.isSubscribed(this.roomId)) {
            console.log("Already subscribed - skipping subscriptions");
            return;
        }

        var history = await this.centrifuge.history(this.roomId, {limit: 10000});
        for(var pub of history.publications){
            handler(pub, true);
        }

        historyDone();

        var realTimeHandler = (ctx: any) => {
            handler(ctx, false);
        }

        this.centrifuge.subscribe(this.roomId, realTimeHandler, {since: {epoch: history.epoch, offset: history.offset}}).on('subscribe', async (ctx) => {
            console.log("Subscribed to room " + this.roomId, ctx);
            if(ctx.recovered === false){
                console.warn("FAILED TO GET CLIENT UP TO DATE");
            }
        });
    }

    connect(){
        this.centrifuge.connect();
    }

    disconnect(){
        this.centrifuge.disconnect();
    }

    isConnected(){
        return this.centrifuge.isConnected();
    }

    isSubscribed(channel: string){
        return this.centrifuge.getSub(channel);
    }
}

export default GameHostClient;