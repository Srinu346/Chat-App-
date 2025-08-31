
import React from "react";
import { Button } from "./button";

interface CreateRoomProps {
    title?: string;
    description?: string;
    onClose: () => void;
    ref?: React.RefObject<HTMLInputElement | null>;
    onCreate?: () => void;
}

export const CreateRoom = ({ title, description, onClose, ref, onCreate }: CreateRoomProps) => {
    return (
        <div className="modal bg-black rounded-lg opacity-100 ">
            <h2 className="text-white">{title || "Create Room"}</h2>
            <p className="text-gray-400">{description || "Enter the room name to create a new chat room."}</p>
            <input type="text" placeholder="Room Name" className="mt-2 p-2 rounded text-white " ref={ref} />
            <Button label="Create" onClick={onCreate} />
        </div>
    );
};
