import Centrifuge from "centrifuge";

class Client {
    centrifuge: Centrifuge;

    constructor(){
        this.centrifuge = new Centrifuge('ws://localhost:8000/connection/websocket');

        this.centrifuge.on('connect', function(ctx){
            console.log('Connected over ' + ctx.transport);
        });
        this.centrifuge.on('disconnect', function(ctx){
            console.log('Disconnected: ' + ctx.reason);
        });
    }
}

export default Client;