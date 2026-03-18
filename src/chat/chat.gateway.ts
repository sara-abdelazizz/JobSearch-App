import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { ChatService } from "./chat.service";
import type { IOAuthSocket } from "src/comon/Sockets/gateway.dto";
import { emitToUsers } from "src/comon/Sockets/socket.manager";

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage("sendMessage")
  async handleMessage(
    @ConnectedSocket() client: IOAuthSocket,
    @MessageBody() data: any,
  ) {
    const userId = client.credentials?.user?._id;

    if (!userId) {
      throw new Error("Unauthorized socket user");
    }

    const result = await this.chatService.sendMessage(
      userId,
      data.receiverId,
      data.message,
    );

    emitToUsers([data.receiverId], "receiveMessage", result);
    client.emit("messageSent", result);
  }
}