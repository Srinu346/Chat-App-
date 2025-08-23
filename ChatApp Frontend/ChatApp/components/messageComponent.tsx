interface MessageBubbleProps {
    text : String;
    time : String;
    user : String;
}

export function MessageBubble ({ text, time, user }: MessageBubbleProps){
    
    const isSelf = user === 'self';
    const selfStyles = "bg-teal-500 items-end rounded-xl "
    const OtherStyles = "bg-gray-500 items-start rounded-xl "
    const avatar = user[0]
    
    return (
        <div className={`flex items-end mb-4 ${isSelf ? 'justify-end' : 'justify-start'}`}>
            <div className="flex flex-row">
                <div className={`w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center ${isSelf ? 'order-2 ml-2' : 'order-1 mr-2'}`}>
                {avatar}
                </div>
                <div className="flex flex-col">
                <div className={`${isSelf ? selfStyles : OtherStyles} p-3 max-w-sm`}>
                    <span className="break-words">{text}</span>
                </div>
                <div className={`text-xs text-gray-400 mt-1 ${isSelf ? 'text-right' : 'text-left'}`}>
                    {time}
                </div>
                </div>
            </div>
        </div>
    )
}