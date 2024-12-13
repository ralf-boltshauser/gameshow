import Lobby from "@/components/lobby";

export default function LobbyPage() {
  return (
    <Lobby url={process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000"} />
  );
}
