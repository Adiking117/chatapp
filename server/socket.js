import { Server } from "socket.io";
import Redis from 'ioredis';
import { produceMessage } from "./kafka.js";

const pub = new Redis({
    host: "redis-38c28d91-student-0e4a.k.aivencloud.com",
    port: 11009,
    username: "default",
    password: "AVNS_M5lqfWvBH4CmLEQ21z4"
});

const sub = new Redis({
    host: "redis-38c28d91-student-0e4a.k.aivencloud.com",
    port: 11009,
    username: "default",
    password: "AVNS_M5lqfWvBH4CmLEQ21z4"
});

class SocketService {
    constructor() {
        console.log("init socket server");
        this._io = new Server({
            cors: {
                allowedHeaders: ["*"],
                origin: "*"
            }
        });
        sub.subscribe("MESSAGES");
        this.users = {}; // to keep track of connected users
    }

    initListeners() {
        const io = this.io;
        console.log("Initialised socket listeners");

        io.on('connect', (socket) => {
            console.log(`New Socket connected ${socket.id}`);

            socket.on('joined', ({ user }) => {
                this.users[socket.id] = user;
                console.log(`${user} has joined`);
                socket.broadcast.emit('userjoined', { user: "Admin", message: `${user} has joined the chat` });
                socket.emit('welcome', { user: "Admin", message: `Welcome to AdiGram, ${user}` });
            });

            socket.on('disconnect', () => {
                const user = this.users[socket.id];
                if (user) {
                    socket.broadcast.emit('leave', { user: "Admin", message: `${user} has left` });
                    console.log(`${user} left`);
                    delete this.users[socket.id];
                }
            });

            socket.on('message', async({ message, id }) => {
                io.emit('sendMessage', { user: this.users[socket.id], message, id });
                console.log(`New Message Received ${message}`);
                // publish this msg to redis
                await pub.publish('MESSAGES', JSON.stringify({ message }));
            });
        });

        sub.on('message', async (channel, message) => {
            if (channel === 'MESSAGES') {
                console.log("New message from redis ", message);
                io.emit('message', message);
                // message producing to kafka broker
                await produceMessage(message);
                console.log("message produced to kafka broker");
            }
        });
    }

    get io() {
        return this._io;
    }
}

export default SocketService;
