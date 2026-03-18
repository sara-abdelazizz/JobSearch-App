import { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { decodedToken } from "../utils/token/token";
import { TokenTypeEnum } from "../enums/user.enums";
import { IOAuthSocket } from "./gateway.dto";

let io: Server | null = null;

const connectedSockets = new Map<string, string[]>();

export const initializeSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.use(async (socket: IOAuthSocket, next) => {
    try {
      const { user, decoded } = await decodedToken({
        authorization: socket.handshake.auth.authorization,
        tokenType: TokenTypeEnum.ACCESS,
      });

      const userId = user._id.toString();

      const userTabs = connectedSockets.get(userId) || [];
      userTabs.push(socket.id);
      connectedSockets.set(userId, userTabs);

      socket.credentials = {
        user,
        decoded,
      };

      next();
    } catch (error: any) {
      next(error);
    }
  });

  io.on("connection", (socket: IOAuthSocket) => {
    handleDisconnect(socket);
  });
};

const handleDisconnect = (socket: IOAuthSocket) => {
  socket.on("disconnect", () => {
    const userId = socket.credentials?.user._id?.toString() as string;

    const remainingTabs =
      connectedSockets.get(userId)?.filter((tab) => tab !== socket.id) || [];

    if (remainingTabs.length) {
      connectedSockets.set(userId, remainingTabs);
    } else {
      connectedSockets.delete(userId);
    }

    console.log("Connected sockets:", connectedSockets);
  });
};

export const getIo = (): Server => {
  if (!io) {
    throw new Error("socket.io is not initialized");
  }
  return io;
};

export const getConnectedSockets = () => connectedSockets;