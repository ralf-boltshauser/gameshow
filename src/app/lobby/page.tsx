"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

type Participant = {
  id: string;
  name: string;
  clicked: boolean;
  clickTime?: number;
  points: number;
};

export default function Lobby() {
  const [socket, setSocket] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [clickOrder, setClickOrder] = useState<string[]>([]);

  useEffect(() => {
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("participants", (updatedParticipants: Participant[]) => {
      // Sort participants by points in descending order
      const sortedParticipants = [...updatedParticipants].sort(
        (a, b) => b.points - a.points
      );
      setParticipants(sortedParticipants);
    });

    socket.on("clickOrder", (order: string[]) => {
      setClickOrder(order);
    });

    return () => {
      socket.off("participants");
      socket.off("clickOrder");
    };
  }, [socket]);

  const handleReset = () => {
    if (socket) {
      socket.emit("reset");
    }
  };

  const handleResetPoints = () => {
    if (socket) {
      socket.emit("resetPoints");
    }
  };

  const handlePoints = (participantId: string, correct: boolean) => {
    if (socket) {
      socket.emit("updatePoints", { participantId, correct });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Game Show Lobby</h1>
          <div className="space-x-4">
            <button
              onClick={handleReset}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
            >
              Reset Buzzers
            </button>
            <button
              onClick={handleResetPoints}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Reset Points
            </button>
            <Link
              href="/"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Join as Participant
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Participants</h2>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">{participant.name}</span>
                    <span className="text-sm text-gray-500">
                      Points: {participant.points}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        participant.clicked
                          ? "bg-green-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      {participant.clicked ? "Clicked!" : "Waiting"}
                    </span>
                    {participant.clicked && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePoints(participant.id, true)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition text-sm"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handlePoints(participant.id, false)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
                        >
                          ✗
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {participants.length === 0 && (
                <p className="text-gray-500">No participants yet</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Click Order</h2>
            <div className="space-y-2">
              {clickOrder.map((name, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded"
                >
                  <span className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full mr-3">
                    {index + 1}
                  </span>
                  <span>{name}</span>
                </div>
              ))}
              {clickOrder.length === 0 && (
                <p className="text-gray-500">No clicks yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
