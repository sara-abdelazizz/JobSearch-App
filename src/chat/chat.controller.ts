import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ChatService } from "./chat.service";
import { AuthGuard } from "src/comon/guards/auth.guards";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post("send")
  @UseGuards(AuthGuard)
  sendMessage(@Req() req: any, @Body() body: any) {
    return this.chatService.sendMessage(
      req.user._id,
      body.receiverId,
      body.message,
    );
  }

  @Get(":otherUserId")
  @UseGuards(AuthGuard)
  getChat(@Req() req: any, @Param("otherUserId") otherUserId: string) {
    return this.chatService.getChatHistory(
      req.user._id,
      otherUserId,
    );
  }
}