import React, { useState, useRef, useEffect } from "react";
import { Button } from "../components/button";
import { CopyIcon } from "../icons/CopyIcon";
import { joinRoom, createRoom, leaveRoom } from "../util/backendCalls";
import { toast, ToastContainer, Bounce } from "react-toastify";
import { MessageBubble } from "../components/messageComponent";


export const ChatRoom = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const roomIdRef = useRef<HTMLInputElement | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<
    { text: string; time: string; user: string; isSelf: boolean }[]
  >([]);
  const [users, setUsers] = useState<number>(0);
  const [userList, setUserList] = useState<string[]>([]);
  const [username, setUsername] = useState<string>(localStorage.getItem("username") || "");

  const fetchActiveUsers = async (roomId: string | null) => {
    const res = await fetch('http://localhost:3000/activeUsers', {
      method: 'POST',
      body: JSON.stringify({ roomId }),
      headers: { "Content-Type": "application/json" }
    });

    return res;
  };

  // Setup WebSocket
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    const roomId = localStorage.getItem("roomID") || roomIdRef.current?.value;
    if (!roomId) return;
    console.log("Attempting to join room:", roomId);
    setMessages([]);

    const storedUser = localStorage.getItem("username") || "";

    ws.onopen = () => {
      if (roomId) {
        console.log("WebSocket connection established");
        ws.send(JSON.stringify({ type: "join", roomId, user: storedUser }));
        console.log("Joined room:", roomId);
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message") {
        setMessages((prev) => [
          ...prev,
          { text: data.message, isSelf: false, user: data.user || "Other User", time: data.time },
        ]);
      }
      if (data.type === "userList") {
        setUserList(data.users || []);
        setUsers(data.users?.length || 0);
      }
    };

    setSocket(ws);

    return () => {
      ws.close();
      localStorage.removeItem("roomID");
    };
  }, []);

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

  // Fetch active users when roomId changes
  useEffect(() => {
    const roomId = localStorage.getItem("roomID");
    if (roomId) {
      const res = async () => {
        const response = await fetchActiveUsers(roomId);
        const data = await response.json();
        setUsers(data.numberOfUsers);
        if (data.userList) setUserList(data.userList);
        if (roomIdRef.current) {
          roomIdRef.current.value = roomId;
        }
      };
      res();
    }
  });

  const currentRoomId = localStorage.getItem("roomID");

  // Avatar color helper
  const avatarColors = [
    "from-violet-500 to-purple-600",
    "from-cyan-500 to-blue-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
    "from-indigo-500 to-blue-600",
  ];
  function getAvatarColor(name: string) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return avatarColors[Math.abs(h) % avatarColors.length];
  }

  return (
    <div className="bg-[#0a0a0f] min-h-screen flex flex-col">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
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

      {/* ─── Top Navigation Bar ─── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#0d0d14]/80 backdrop-blur-md sticky top-0 z-50">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-sm">💬</span>
          </div>
          <h1 className="text-lg font-semibold text-white tracking-tight">ChatRoom</h1>
        </div>

        {/* Center Controls */}
        <div className="flex items-center gap-3">
          {/* Username Input */}
          <div className="relative">
            <input
              className="bg-white/[0.06] border border-white/[0.08] text-white text-sm py-2 px-4 rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-gray-500"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name"
            />
          </div>

          {/* Room ID Input */}
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-lg pl-3 pr-1">
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Room:</span>
            <input
              className="bg-transparent text-center text-white text-sm py-2 px-2 w-28 focus:outline-none placeholder-gray-500"
              type="text"
              ref={roomIdRef}
              placeholder="Enter ID"
            />
            <button
              onClick={copyText}
              className="p-1.5 rounded-md hover:bg-white/[0.08] transition-colors text-gray-400 hover:text-white"
            >
              <CopyIcon />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            label="Create Room"
            variant="primary"
            onClick={() => createRoom({ socket, ref: roomIdRef, setRoomId, user: username, type: "join" })}
          />
          {username && (
            <Button
              label="Join Room"
              onClick={() => joinRoom({ socket, ref: roomIdRef, setRoomId, user: username, type: "join" })}
            />
          )}
          {currentRoomId && (
            <Button
              label="Leave"
              variant="danger"
              onClick={() => leaveRoom(roomIdRef.current?.value || "")}
            />
          )}
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Area */}
        <main className="flex-1 flex flex-col">
          <ChatInterface socket={socket} messages={messages} setMessages={setMessages} />
        </main>

        {/* ─── Sidebar: Active Users ─── */}
        {currentRoomId && (
          <aside className="w-64 border-l border-white/[0.06] bg-[#0d0d14]/60 backdrop-blur-md flex flex-col animate-fade-in">
            {/* Sidebar Header */}
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot"></div>
                <span className="text-sm font-medium text-gray-300">
                  Active Users <span className="text-gray-500">({users})</span>
                </span>
              </div>
            </div>
            {/* User List */}
            <div className="flex-1 overflow-y-auto px-3 py-3">
              <div className="space-y-1">
                {userList.map((u, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors animate-fade-in"
                  >
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(u)} flex items-center justify-center text-xs font-semibold text-white shadow-sm`}
                    >
                      {u?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-200 font-medium">
                        {u} {u === username ? <span className="text-gray-500 text-xs">(you)</span> : ""}
                      </span>
                      <span className="text-[10px] text-emerald-400">Online</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};


// ─── Chat Interface Component ────────────────────────────────────
const ChatInterface = ({
  socket,
  messages,
  setMessages,
}: {
  socket: WebSocket | null;
  messages: { text: string; time: string; user: string; isSelf: boolean }[];
  setMessages: React.Dispatch<
    React.SetStateAction<{ text: string; time: string; user: string; isSelf: boolean }[]>
  >;
}) => {
  const messageRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      const hours = now.getHours().toString();
      let minutes = now.getMinutes().toString();
      if (minutes.length === 1) {
        minutes = "0" + minutes;
      }
      const time = hours + ":" + minutes;
      const user = localStorage.getItem("username") || "Unknown";
      socket.send(JSON.stringify({ type: "message", roomId, message, time, user, isSelf: true }));

      setMessages((prev) => [
        ...prev,
        { text: message, user: user, time: time, isSelf: true },
      ]);

      if (messageRef.current) {
        messageRef.current.value = "";
      }
    }
  }

  const roomID = localStorage.getItem("roomID");

  return (
    <div className="flex-1 flex flex-col">
      {roomID ? (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center animate-slide-up">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
                  <span className="text-3xl">💬</span>
                </div>
                <p className="text-gray-400 text-sm font-medium">No messages yet</p>
                <p className="text-gray-600 text-xs mt-1">Start the conversation!</p>
              </div>
            )}
            {messages.map((message, index) => (
              <MessageBubble key={index} text={message.text} user={message.user} time={message.time} isSelf={message.isSelf} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Bar */}
          <div className="px-6 py-4 border-t border-white/[0.06] bg-[#0d0d14]/60 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <input
                ref={messageRef}
                type="text"
                placeholder="Type a message..."
                className="flex-1 rounded-xl px-4 py-3 bg-white/[0.06] border border-white/[0.08] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all placeholder-gray-500"
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={sendMessage}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 px-5 py-3 rounded-xl text-white text-sm font-medium shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                Send
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center animate-slide-up">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center mb-6">
            <span className="text-4xl">🚀</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Welcome to ChatRoom</h2>
          <p className="text-gray-500 text-sm max-w-xs text-center">
            Create a new room or join an existing one to start chatting with your friends in real-time.
          </p>
        </div>
      )}
    </div>
  );
};
