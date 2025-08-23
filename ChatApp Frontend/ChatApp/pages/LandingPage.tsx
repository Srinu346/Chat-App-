import { useState, useRef, useEffect } from "react";
import { Button } from "../components/button";
import { CopyIcon } from "../icons/CopyIcon";
import { joinRoom, createRoom , leaveRoom } from "../util/backendCalls";
import { toast, ToastContainer, Bounce } from "react-toastify";
import { MessageBubble } from "../components/messageComponent";

export const ChatRoom = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const roomIdRef = useRef<HTMLInputElement | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<
    { text: string; self: boolean; time: string; user: string }[]
  >([]);

  // Setup WebSocket
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    const roomId = localStorage.getItem("roomID");
    console.log("Attempting to join room:", roomId);
    setMessages([]);

    ws.onopen = () => {
      if (roomId) {
        ws.send(JSON.stringify({ type: "join", roomId }));
        console.log("Joined room:", roomId);
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message") {
        setMessages((prev) => [
          ...prev,
          { text: data.message, self: false, user: data.user, time: data.time },
        ]);
      }
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [roomId]);

  // Copy Room ID
  const copyText = () => {
    const text = roomIdRef.current?.value || "";
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast("Copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <div className="bg-[#000000] h-screen">
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
      {/* Header */}
      <div className="flex flex-col w-full">
        <div className="flex flex-row justify-between">
          <div className="items-start p-4">
            <Button label="Create Room" onClick={() => createRoom({ ref: roomIdRef, setRoomId })} className="text-white bg-[#222222] hover:text-green-400" />
          </div>
          <div className="items-end flex flex-row p-4">
            <div className="text-center text-white items-end">
              <div className="flex flex-row pr-3 items-center h-full p-2">
                <span>Room Id:</span>
                <input
                  className="bg-[#222222] text-center text-white py-1 px-2 rounded-lg w-[10vw]"
                  type="text"
                  ref={roomIdRef}
                />
                <Button onClick={copyText} icon={<CopyIcon />} />
              </div>
            </div>
            <div className="items-end">
              <Button label="Join Room" onClick={() => joinRoom({ ref: roomIdRef, setRoomId })} className="text-white bg-[#222222] hover:text-green-400" />
            </div>
          </div>
        </div>
        <div className="w-full flex justify-end pr-4 ">
          {roomId && (
            <Button label="Leave Room" className="text-white hover:text-red-400" onClick={() => leaveRoom(roomId)} />
          )}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-grow items-center justify-center h-[80vh] w-full text-center justify-center">
        <ChatInterface socket={socket} messages={messages} setMessages={setMessages} />
      </div>
    </div>
  );
};

// Chat Interface Component
const ChatInterface = ({
  socket,
  messages,
  setMessages,
}: {
  socket: WebSocket | null;
  messages: { text: string; self: boolean; time: string; user: string }[];
  setMessages: React.Dispatch<
    React.SetStateAction<{ text: string; self: boolean; time: string; user: string }[]>
  >;
}) => {
  const messageRef = useRef<HTMLInputElement>(null);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      sendMessage();
    }
  }

  function sendMessage() {
    const message = messageRef.current?.value;
    if (message && socket && socket.readyState === WebSocket.OPEN) {
      const roomId = localStorage.getItem("roomID");
      const now = new Date();
      const hours = now.getHours().toString();   // 0 - 23
      const minutes = now.getMinutes().toString(); // 0 - 59
      const time = hours+":"+minutes;
      socket.send(JSON.stringify({ type: "message", roomId, message, time }));

      setMessages((prev) => [
        ...prev,
        { text: message, self: true, user: "self", time: time },
      ]);

      if (messageRef.current) {
        messageRef.current.value = "";
      }
    }
  }

  const roomID = localStorage.getItem("roomID");

  return (
    <div>
      {roomID ? (
        <div className="max-h-[80vh] min-h-[80vh] flex flex-col bg-[#1A1A1A] rounded-xl m-5">
          <div className="flex-1 overflow-y-auto p-2">
            {messages.map((message, index) => (
              <MessageBubble key={index} text={message.text} user={message.user} time={message.time} />
            ))}
          </div>

          <div className="flex items-center gap-2 p-2 border-t border-slate-700">
            <input
              ref={messageRef}
              type="text"
              placeholder="Type a message..."
              className="flex-1 rounded-md px-3 py-2 bg-slate-800 text-white focus:outline-none"
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <div className="text-gray-500">Please join a room to start chatting.</div>
      )}
    </div>
  );
};
