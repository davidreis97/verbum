import Centrifuge from "centrifuge";

class GameHostClient {
    centrifuge: Centrifuge;
    roomId: string;

    constructor(name: string, gameId: number){
        this.centrifuge = new Centrifuge('ws://localhost:8000/connection/websocket', {name});
        this.roomId = "room_"+gameId;
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