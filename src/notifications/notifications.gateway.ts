import { Server } from "socket.io";
import { IOAuthSocket } from "src/comon/Sockets/gateway.dto";

export class NotificationGateway {
  register(socket: IOAuthSocket, io: Server) {
    socket.on("notification:ping", () => {
      socket.emit("notification:pong", {
        message: "Notification gateway is working",
      });
    });
  }
}