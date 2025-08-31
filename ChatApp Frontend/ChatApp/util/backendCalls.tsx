import {toast} from 'react-toastify';

const socket = new WebSocket('ws://localhost:8080');
const roomCode = "ABCDEGHIJKLMNOPQRSTUVWXYZ123456";

interface Messages {
    user: string;
    avatar?: string;
    type: string;
    message?: string;
    roomID?: string;
}


interface createRoomProps {
    user: string;
    avatar?: string;
    type: string;
    message?: string;
    roomID?: string;
    ref ?: React.RefObject<HTMLInputElement | null>;
    setRoomId ?: (roomId: string) => void;
    socket: WebSocket | null;
}

interface joinRoomProps {
    user: string;
    avatar?: string;
    type: string;
    message?: string;
    roomID?: string;
    ref ?: React.RefObject<HTMLInputElement | null>;
    setRoomId ?: (roomId: string) => void;
    socket: WebSocket | null;
}

interface leaveRoomProps {
    user: string;
    roomID: string;
    setRoomId ?: (roomId: string | null) => void;
}


export function joinRoom(joinRoomProp: joinRoomProps) {
    if(!joinRoomProp.user) {
        toast.error("Please enter your name");
        return;
    }
    if(!joinRoomProp.ref?.current) return;
    if(localStorage.getItem("roomID")){
        toast.error("You are already in a room, please leave current room to join another");
        return;
    }

    const roomID = joinRoomProp.ref?.current.value;

    if(!roomID || roomID.length !== 7) {
        toast.error("Please enter a valid Room ID");
        return;
    }

    const user = joinRoomProp.user;

    joinRoomProp.socket?.send(JSON.stringify({ type: "join", roomId: roomID, user }));

    localStorage.setItem("roomID", roomID);
    roomID && joinRoomProp.ref && (joinRoomProp.ref.current.value = roomID);
    joinRoomProp.setRoomId && roomID && joinRoomProp.setRoomId(joinRoomProp.ref.current.value);
    console.log("Join room called");
    toast.success("Joined Room Successfully!");
    window.location.reload();
}

export function createRoom(createRoomProp: createRoomProps) {
    if(!createRoomProp.user) {
        toast.error("Please enter your name");
        return;
    }
    let roomID = "";
    for (let i = 0; i < 7; i++) {
        roomID += roomCode.charAt(Math.floor(Math.random() * roomCode.length));
    }

    createRoomProp.socket?.send(JSON.stringify({ type: "create", roomId: roomID }));

    createRoomProp.ref && (createRoomProp.ref.current.value = roomID);
    localStorage.setItem("roomID", roomID);
    console.log("Create room called");
    toast.success("Room Created Successfully!");
    window.location.reload();
}

export const sendMessage = (message: Messages) => {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    } else {
        socket.onopen = () => {
            socket.send(JSON.stringify(message));
        };
    }
};

export const leaveRoom = (roomID: string) => {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ roomId: roomID, type: "leave" }));
    } else {
        socket.onopen = () => {
            socket.send(JSON.stringify({ roomId: roomID, type: "leave" }));
        };
    }
    localStorage.removeItem("roomID");
    window.location.reload();
    toast.success("Left Room Successfully!");
    window.location.reload();
};
