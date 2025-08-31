import ws from 'ws';
import express, { Request, Response } from 'express';
import { WebSocket } from 'ws';
import cors from 'cors'

const wss = new ws.Server({ port: 8080 });
const app = express();
app.use(cors());

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

            if ((socket as any).roomID && rooms.has((socket as any).roomID)) {
                if (rooms.get((socket as any).roomID)?.has(socket)) {
                    socket.send(JSON.stringify({ system: true, message: "Already connected to this room" }));
                    return;
                }
                rooms.get((socket as any).roomID)?.delete(socket);
            }
            if(!rooms.has(roomID)){
                rooms.set(roomID,new Set());
            }

            rooms.get(roomID)?.add(socket);
            (socket as any).roomID = roomID;


            console.log("Created A Room !!!")

            socket.send(JSON.stringify({system:true,message:"Connected"}))

        }

        if(parsed.type === 'message'){
            const {roomId,message,time,user} = parsed;
            const sockets = rooms.get(roomId);

            if(sockets){
                for(const client of sockets){
                    if(client !== socket){
                        client.send(JSON.stringify({type:"message",user:"Random",message:message,isSelf:false,time}));
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

app.post('/activeUsers',(req,res)=>{
    const roomId = req.body.roomId;
    const numberOfUsers = rooms.get(roomId)?.size;
    console.log(numberOfUsers);
    console.log(numberOfUsers);
    res.json({numberOfUsers})
})

app.listen(3000,()=>{
    console.log('listening on port 3000');
})
