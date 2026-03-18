import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Chat, ChatDocument } from "src/DB/Models/chat.model";
import { Company } from "src/DB/Models/company.model";

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Company.name) private companyModel: Model<Company>,
  ) {}

  private async isHrOrOwner(userId: Types.ObjectId) {
    const company = await this.companyModel.findOne({
      $or: [{ createdBy: userId }, { HRs: userId }],
    });

    return !!company;
  }

  async sendMessage(
    currentUserId: Types.ObjectId,
    receiverId: string,
    message: string,
  ) {
    if (!Types.ObjectId.isValid(receiverId)) {
      throw new BadRequestException("Invalid receiver id");
    }

    const receiverObjectId = new Types.ObjectId(receiverId);

    let chat = await this.chatModel.findOne({
      $or: [
        { senderId: currentUserId, receiverId: receiverObjectId },
        { senderId: receiverObjectId, receiverId: currentUserId },
      ],
    });

    if (!chat) {
      const isHr = await this.isHrOrOwner(currentUserId);

      if (!isHr) {
        throw new ForbiddenException(
          "Only HR or company owner can start chat",
        );
      }

      chat = await this.chatModel.create({
        senderId: currentUserId,
        receiverId: receiverObjectId,
        messages: [],
      });
    }

    const isParticipant =
      chat.senderId.toString() === currentUserId.toString() ||
      chat.receiverId.toString() === currentUserId.toString();

    if (!isParticipant) {
      throw new ForbiddenException("Not allowed in this chat");
    }

    chat.messages.push({
      message,
      senderId: currentUserId,
      createdAt: new Date(),
    } as any);

    await chat.save();

    return {
      message: "Message sent successfully",
      chatId: chat._id,
      lastMessage: chat.messages[chat.messages.length - 1],
    };
  }

  async getChatHistory(
    currentUserId: Types.ObjectId,
    otherUserId: string,
  ) {
    if (!Types.ObjectId.isValid(otherUserId)) {
      throw new BadRequestException("Invalid user id");
    }

    const otherObjectId = new Types.ObjectId(otherUserId);

    const chat = await this.chatModel.findOne({
      $or: [
        { senderId: currentUserId, receiverId: otherObjectId },
        { senderId: otherObjectId, receiverId: currentUserId },
      ],
    });

    if (!chat) {
      return {
        message: "No chat found",
        messages: [],
      };
    }

    return {
      message: "Chat fetched successfully",
      chatId: chat._id,
      messages: chat.messages,
    };
  }
}