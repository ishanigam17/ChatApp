const express = require("express");
const dotenv = require("dotenv");
const { chats} = require("./datafolder/data")
const  cors = require("cors");
const connectDB = require("./config/db");
const app = express();
const userRoutes = require("./routes/userRoute")
const chatRoutes = require("./routes/chatRoute")
const messageRoutes = require("./routes/messageRoute")
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
dotenv.config();
app.use(express.json())
connectDB();
app.use(cors());
app.use(express.json());



app.use("/api/user",userRoutes);
app.use("/api/chat",chatRoutes);
app.use("/api/message",messageRoutes);
app.use(notFound);
app.use(errorHandler);


const port = process.env.PORTNUMBER || 8080;

const server = app.listen(port,()=>{
    console.log(`server started at port ${port}`);
})


const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });
  
  io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("connected");
    });
  
    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("User Joined Room: " + room);
    });
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
  
    socket.on("new message", (newMessageRecieved) => {
      var chat = newMessageRecieved.chat;
  
      if (!chat.users) return console.log("chat.users not defined");
  
      chat.users.forEach((user) => {
        if (user._id === newMessageRecieved.sender._id) return;
  
        socket.in(user._id).emit("message recieved", newMessageRecieved);
      });
    });
  
    socket.off("setup", (userData) => {
      console.log("USER DISCONNECTED");
      socket.leave(userData._id);
    });
  });