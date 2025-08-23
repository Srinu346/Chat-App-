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
    ref ?: React.RefObject<HTMLInputElement>;
    setRoomId ?: (roomId: string) => void;
}

interface joinRoomProps {
    user: string;
    avatar?: string;
    type: string;
    message?: string;
    roomID?: string;
    ref ?: React.RefObject<HTMLInputElement>;
    setRoomId ?: (roomId: string) => void;
}

interface leaveRoomProps {
    user: string;
    roomID: string;
    setRoomId ?: (roomId: string | null) => void;
}

export function joinRoom(joinRoomProp: joinRoomProps) {
    const roomID = joinRoomProp.ref?.current.value;

    if(!roomID || roomID.length !== 7) {
        toast.error("Please enter a valid Room ID");
        return;
    }

    const user = joinRoomProp.user;

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ roomId: roomID, user, type: "join" }));
    } else {
        socket.onopen = () => {
            socket.send(JSON.stringify({ roomId: roomID, user, type: "join" }));
        };
    }

    roomID && joinRoomProp.setRoomId && joinRoomProp.setRoomId(roomID);
    toast.success("Joined Room Successfully!");
}

export function createRoom(createRoomProp: createRoomProps) {
    let roomID = "";
    for (let i = 0; i < 7; i++) {
        roomID += roomCode.charAt(Math.floor(Math.random() * roomCode.length));
    }

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "join", user: "self", roomId: roomID }));
    } else {
        socket.onopen = () => {
            socket.send(JSON.stringify({ type: "join", user: "self", roomId: roomID }));
        };
    }

    createRoomProp.ref && (createRoomProp.ref.current.value = roomID);
    createRoomProp.setRoomId && createRoomProp.setRoomId(roomID);
    localStorage.setItem("roomID", roomID);
    toast.success("Room Created Successfully!");
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
};
