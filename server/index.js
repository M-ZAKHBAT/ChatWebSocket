import express from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import { Server } from "socket.io";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: false,
  },
});

mongoose.connect(
  "mongodb+srv://zakhbatmohammed:mohamed123@cluster0.x5so094.mongodb.net/chatApp",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

const messageSchema = new mongoose.Schema({
  room: String,
  author: String,
  username: String,
  message: String,
  time: String,
});

const Message = mongoose.model("Message", messageSchema);

// Route pour récupérer les messages depuis la base de données
app.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

io.on("connection", (socket) => {
  console.log(`User Connected : ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID : ${socket.id} joined room : ${data}`);
  });

  socket.on("send_message", async (data) => {
    const message = new Message({
      room: data.room,
      author: data.author,
      username: data.username,
      message: data.message,
      time: data.time,
    });

    try {
      await message.save();
      socket.to(data.room).emit("receive_message", data);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Server Running");
});
