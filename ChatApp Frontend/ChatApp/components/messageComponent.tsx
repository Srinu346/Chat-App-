interface MessageBubbleProps {
  text: string;
  time: string;
  user: string;
  isSelf: boolean;
}

const avatarColors = [
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-blue-600",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function MessageBubble({ text, time, user, isSelf }: MessageBubbleProps) {
  const initial = isSelf ? "U" : user?.charAt(0)?.toUpperCase() || "?";
  const colorClass = getAvatarColor(user || "Unknown");

  return (
    <div
      className={`flex mb-3 animate-fade-in ${isSelf ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex items-end max-w-[70%] gap-2 ${isSelf ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-xs font-semibold text-white shadow-md flex-shrink-0`}
        >
          {initial}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
          {!isSelf && (
            <span className="text-[11px] text-gray-400 mb-1 ml-1 font-medium">
              {user}
            </span>
          )}
          <div
            className={`px-4 py-2.5 shadow-lg ${
              isSelf
                ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl rounded-br-md"
                : "bg-[#1e2030] text-gray-100 rounded-2xl rounded-bl-md border border-white/[0.06]"
            }`}
          >
            <span className="break-words text-[14px] leading-relaxed">{text}</span>
          </div>
          <div
            className={`text-[10px] text-gray-500 mt-1 ${isSelf ? "mr-1" : "ml-1"}`}
          >
            {time}
          </div>
        </div>
      </div>
    </div>
  );
}
