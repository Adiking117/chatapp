import http from "http";
import SocketService from "./socket.js";
import { startMessageConsumer } from "./kafka.js";

async function init() {
    const socketService = new SocketService();
    
    const httpServer = http.createServer();
    const PORT = process.env.PORT || 8000;

    socketService.io.attach(httpServer);

    httpServer.listen(PORT, () => {
        console.log('Server started at port', PORT);
    });

    socketService.initListeners();

    startMessageConsumer(socketService.io);
}

init();
