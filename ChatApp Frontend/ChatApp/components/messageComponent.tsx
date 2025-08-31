interface MessageBubbleProps {
  text: string;
  time: string;
  user: string;
  isSelf: boolean;
}

export function MessageBubble({ text, time, user, isSelf }: MessageBubbleProps) {
  const selfStyles =
    "bg-teal-500 text-white rounded-xl rounded-br-md m-2";
  const otherStyles =
    "bg-gray-600 text-white rounded-xl rounded-bl-md m-2";

  const avatar = isSelf ? "You" : user[0];

  return (
    <div
      className={`flex mb-4 ${
        isSelf ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex items-end max-w-[70%] ${
          isSelf ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-xs font-medium ${
            isSelf ? "ml-2" : "mr-2"
          }`}
        >
          {avatar}
        </div>

        {/* Message + Time */}
        <div className="flex flex-col">
          <div
            className={`${isSelf ? selfStyles : otherStyles} p-3 shadow-sm`}
          >
            <span className="break-words">{text}</span>
          </div>
          <div
            className={`text-xs text-gray-400 mt-1 ${
              isSelf ? "text-right" : "text-left"
            }`}
          >
            {time}
          </div>
        </div>
      </div>
    </div>
  );
}
