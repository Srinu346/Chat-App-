import ws from 'ws';
import express, { Request, Response } from 'express';
import { WebSocket } from 'ws';
import cors from 'cors'

const wss = new ws.Server({ port: 8080 });
const app = express();
app.use(cors());

interface DataProps {
    type?: String,
    roomId?: string
}

interface roomProps {
    roomID?: String
}

const allSockets = [];
const rooms = new Map<string, Set<WebSocket>>();
const roomUsers = new Map<string, Map<WebSocket, string>>();

app.use(express.json());

function broadcastUserList(roomID: string) {
    const sockets = rooms.get(roomID);
    const users = roomUsers.get(roomID);
    if (!sockets || !users) return;
    const userList = Array.from(users.values());
    for (const client of sockets) {
        client.send(JSON.stringify({ type: "userList", users: userList }));
    }
}

wss.on('connection', (socket: WebSocket) => {

    socket.on('message', (data: DataProps) => {
        const parsed = JSON.parse(data.toString());

        if (parsed.type === 'join') {
            const roomID = parsed.roomId;
            const user = parsed.user || "Anonymous";

            if ((socket as any).roomID && rooms.has((socket as any).roomID)) {
                if (rooms.get((socket as any).roomID)?.has(socket)) {
                    socket.send(JSON.stringify({ system: true, message: "Already connected to this room" }));
                    return;
                }
                rooms.get((socket as any).roomID)?.delete(socket);
                roomUsers.get((socket as any).roomID)?.delete(socket);
            }
            if (!rooms.has(roomID)) {
                rooms.set(roomID, new Set());
                roomUsers.set(roomID, new Map());
            }

            rooms.get(roomID)?.add(socket);
            roomUsers.get(roomID)?.set(socket, user);
            (socket as any).roomID = roomID;

            console.log(`User "${user}" joined room ${roomID}`);

            socket.send(JSON.stringify({ system: true, message: "Connected" }));
            broadcastUserList(roomID);
        }

        if (parsed.type === 'message') {
            const { roomId, message, time, user } = parsed;
            const sockets = rooms.get(roomId);

            if (sockets) {
                for (const client of sockets) {
                    if (client !== socket) {
                        client.send(JSON.stringify({ type: "message", user: `${user}`, message: message, isSelf: false, time: `${time}` }));
                    }
                }
            }
        }

        if (parsed.type === 'leave') {
            for (const [roomId, sockets] of rooms) {
                sockets.delete(socket);
                roomUsers.get(roomId)?.delete(socket);
                if (sockets.size === 0) {
                    rooms.delete(roomId);
                    roomUsers.delete(roomId);
                } else {
                    broadcastUserList(roomId);
                }
            }
        }
    })

    socket.on("close", () => {
        const roomId = (socket as any).roomID;
        if (roomId && rooms.has(roomId)) {
            rooms.get(roomId)?.delete(socket);
            roomUsers.get(roomId)?.delete(socket);
            console.log(`Socket left room ${roomId}`);
            if (rooms.get(roomId)?.size === 0) {
                rooms.delete(roomId);
                roomUsers.delete(roomId);
            } else {
                broadcastUserList(roomId);
            }
        }
    });

});

app.post('/activeUsers', (req, res) => {
    const roomId = req.body.roomId;
    const numberOfUsers = rooms.get(roomId)?.size || 0;
    const users = roomUsers.get(roomId);
    const userList = users ? Array.from(users.values()) : [];
    res.json({ numberOfUsers, userList })
})

app.listen(3000, () => {
    console.log('listening on port 3000');
})
