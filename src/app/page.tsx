"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type Participant = {
  id: string;
  name: string;
  clicked: boolean;
  clickTime?: number;
  points: number;
};

export default function Home() {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const newSocket = io("http://10.65.4.1:4000");
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("participants", (participants: Participant[]) => {
      const participant = participants.find((p) => p.id === socket.id);
      if (participant) {
        setClicked(participant.clicked);
      }
    });

    return () => {
      socket.off("participants");
    };
  }, [socket]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && socket) {
      socket.emit("join", name);
      setJoined(true);
    }
  };

  const handleClick = () => {
    if (socket && !clicked) {
      socket.emit("click");
    }
  };

  if (!joined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Join Battle</h1>
          <form onSubmit={handleJoin} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-2 border rounded"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
            >
              Join
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-xl mb-8">Welcome, {name}!</div>
      <button
        onClick={handleClick}
        disabled={clicked}
        className={`w-64 h-64 rounded-full ${
          clicked
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-red-500 hover:bg-red-600 active:bg-red-700"
        } text-white text-2xl font-bold shadow-lg transition transform hover:scale-105`}
      >
        {clicked ? "Clicked!" : "BUZZ!"}
      </button>
    </div>
  );
}
