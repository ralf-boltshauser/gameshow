const { Server } = require("socket.io");

const participants = new Map();
let clickOrder = [];

const io = new Server({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join", (name) => {
    participants.set(socket.id, {
      id: socket.id,
      name,
      clicked: false,
      points: 0,
    });
    io.emit("participants", Array.from(participants.values()));
  });

  socket.on("click", () => {
    const participant = participants.get(socket.id);
    if (participant && !participant.clicked) {
      participant.clicked = true;
      participant.clickTime = Date.now();
      clickOrder.push(socket.id);
      participants.set(socket.id, participant);
      io.emit("participants", Array.from(participants.values()));
      io.emit(
        "clickOrder",
        clickOrder.map((id) => participants.get(id)?.name)
      );
    }
  });

  socket.on("updatePoints", ({ participantId, correct }) => {
    const participant = participants.get(participantId);
    if (participant) {
      participant.points += correct ? 1 : -1;
      participants.set(participantId, participant);
      io.emit("participants", Array.from(participants.values()));
    }
  });

  socket.on("reset", () => {
    participants.forEach((participant) => {
      participant.clicked = false;
      participant.clickTime = undefined;
    });
    clickOrder = [];
    io.emit("participants", Array.from(participants.values()));
    io.emit("clickOrder", []);
  });

  socket.on("resetPoints", () => {
    participants.forEach((participant) => {
      participant.points = 0;
    });
    io.emit("participants", Array.from(participants.values()));
  });

  socket.on("disconnect", () => {
    participants.delete(socket.id);
    clickOrder = clickOrder.filter((id) => id !== socket.id);
    io.emit("participants", Array.from(participants.values()));
    io.emit(
      "clickOrder",
      clickOrder.map((id) => participants.get(id)?.name)
    );
  });
});

io.listen(3001);
