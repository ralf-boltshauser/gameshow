import Participant from "@/components/participant";

export default function Home() {
  return (
    <div>
      <Participant
        url={process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000"}
      />
    </div>
  );
}
