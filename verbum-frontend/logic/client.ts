import Centrifuge from "centrifuge";

class GameHostClient {
    centrifuge: Centrifuge;

    constructor(){
        this.centrifuge = new Centrifuge('ws://localhost:8000/connection/websocket');
    }

    onConnect(handler: (...args: any[]) => void){
        this.centrifuge.on('connect', function(ctx){
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

    hookGameCallbacks(id: Number, handler: (...args: any[]) => void){
        var roomId = "room_"+id;
        this.centrifuge.subscribe(roomId, handler); 
    }

    connect(){
        this.centrifuge.connect();
    }

    isConnected(){
        return this.centrifuge.isConnected();
    }
}

export default GameHostClient;