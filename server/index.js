// const http = require("http");
// const express= require("express");
// const cors = require("cors");
// const socketIO = require("socket.io");
// const SocketService = require('./socket.js')
// const {startMessageConsumer} = require("./kafka.js")



// const users=[{}];

// app.use(cors());

// // app.get("/",(req,result)=>{
// //     result.send("Working")
// // })

// const app = express();
// const port =  4500 || process.env.PORT;
// const server = http.createServer(app);
// const io = socketIO(server);

// io.on("connect",(socket)=>{
//     console.log("New Connection");
//     socket.on('joined',({user})=>{
//         users[socket.id]=user;
//         console.log(`${user} has Joineed`);
//         socket.broadcast.emit('userjoined',{user:"Admin",message:`${users[socket.id]} has joined the chat`});
//         socket.emit('welcome',{user:"Admin",message: `Welcomes to AdiGram , ${users[socket.id]}`});
//     })

//     socket.on(`disconect`,()=>{
//         socket.broadcast.emit('leave',{user:"Admin",message:`${users[socket.id]}  has left`});
//         console.log(`${users[socket.id]} left`);
//     })

//     socket.on('message',({message,id})=>{
//         io.emit('sendMessage',{user:users[socket.id],message,id});
//     })
// })

// server.listen(port,()=>{
//     console.log(`Server is working on http://localhost:${port}`);
// })





import http from "http"
import SocketService from "./socket.js"
import { startMessageConsumer } from "./kafka.js";

async function init(){
    startMessageConsumer();
    const socketService = new SocketService();
    
    const httpServer = http.createServer()
    const PORT =  process.env.PORT || 8000

    socketService.io.attach(httpServer)

    httpServer.listen(PORT,()=>{
        console.log('Server Started at port ',PORT)
    })

    socketService.initListeners()
}

init()
