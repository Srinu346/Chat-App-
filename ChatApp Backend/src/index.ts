import ws from 'ws';
import express, { Request, Response } from 'express';
import { WebSocket } from 'ws';

const wss = new ws.Server({ port: 8080 });
const app = express();

interface DataProps {
    type?:String,
    roomId?:string
}

interface roomProps {
    roomID?:String
}

const allSockets = [];
const rooms = new Map<string, Set<WebSocket>>();

app.use(express.json());


wss.on('connection',(socket:WebSocket)=>{

    socket.on('message',(data:DataProps)=>{
        const parsed = JSON.parse(data.toString());

        if(parsed.type === 'join')
        {
            const roomID = parsed.roomId;
            
            if(!rooms.has(roomID)){
                rooms.set(roomID,new Set());
            }

            rooms.get(roomID)?.add(socket);
            (socket as any).roomID = roomID;

            console.log(roomID)

            console.log(rooms.get(roomID)?.size)

            socket.send(JSON.stringify({system:true,message:"Connected"}))

        }

        if(parsed.type === 'message'){
            const {roomId,message,time} = parsed;
            const sockets = rooms.get(roomId);


            console.log(rooms);
            console.log(message + "is received")

            if(sockets){
                for(const client of sockets){
                    if(client !== socket){
                        client.send(JSON.stringify({type:"message",user:"Random",message:message,self:false,time}));
                    }
                }
            }
        }

        if(parsed.type === 'leave'){
            for (const [roomId, sockets] of rooms) {
            sockets.delete(socket); 

            if (sockets.size === 0) {
            rooms.delete(roomId);
            }
            }
        }
    })

    socket.on("close", () => {
    const roomId = (socket as any).roomId;
    if (roomId && rooms.has(roomId)) {
      rooms.get(roomId)?.delete(socket);
      console.log(`Socket left room ${roomId}`);
    }
  });

});

app.listen(3000,()=>{
    console.log('listening on port 3000');
})
