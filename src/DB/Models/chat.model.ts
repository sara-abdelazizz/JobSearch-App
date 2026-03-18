import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";

@Schema({ _id: false })
export class ChatMessage {
  @Prop({ required: true })
  message: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  })
  senderId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

@Schema({ timestamps: true })
export class Chat {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  })
  senderId: Types.ObjectId; 

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  })
  receiverId: Types.ObjectId; 

  @Prop({
    type: [ChatMessageSchema],
    default: [],
  })
  messages: ChatMessage[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
export type ChatDocument = HydratedDocument<Chat>;

export const ChatModel = MongooseModule.forFeature([
  { name: Chat.name, schema: ChatSchema },
]);