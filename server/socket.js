import { Server } from "socket.io";
import Redis from 'ioredis';
import { produceMessage } from "./kafka.js";
import dotenv from 'dotenv';
dotenv.config();

const redisConfig = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD
};

const pub = new Redis(redisConfig);
const sub = new Redis(redisConfig);

class SocketService {
    constructor() {
        console.log("Initializing socket server");
        this._io = new Server({
            cors: {
                allowedHeaders: ["*"],
                origin: "*"
            }
        });
        this.users = {}; 
        this.initRedisSubscription();
    }

    initRedisSubscription() {
        sub.subscribe("MESSAGES", (err, count) => {
            if (err) {
                console.error("Failed to subscribe to Redis channel 'MESSAGES'", err);
            } else {
                console.log(`Subscribed to ${count} channel(s). Listening for updates on the 'MESSAGES' channel.`);
            }
        });

        sub.on('message', async (channel, message) => {
            if (channel === 'MESSAGES') {
                console.log("New message from Redis:", message);
                try {
                    // Produce message to Kafka
                    await produceMessage(message);
                    console.log("Message produced to Kafka broker");
                } catch (err) {
                    console.error("Error producing message to Kafka:", err);
                }
            }
        });

        sub.on('error', (err) => {
            console.error("Redis subscription error:", err);
        });
    }

    initListeners() {
        const io = this.io;
        console.log("Initialized socket listeners");

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

            socket.on('message', async ({ message, id }) => {
                console.log(`New Message Received: ${message}`);
                try {
                    // Publish message to Redis
                    await pub.publish('MESSAGES', JSON.stringify({ message, id, user: this.users[socket.id] }));
                    console.log(`Message published to Redis: ${message}`);
                } catch (err) {
                    console.error("Error publishing message to Redis:", err);
                }
            });
        });
    }

    get io() {
        return this._io;
    }
}

export default SocketService;
