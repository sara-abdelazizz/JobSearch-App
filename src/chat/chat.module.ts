import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatModel } from 'src/DB/Models/chat.model';
import { UserModel } from 'src/DB/Models/user.model';
import { CompanyModel } from 'src/DB/Models/company.model';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports:[ChatModel , UserModel,CompanyModel],
  controllers: [ChatController],
  providers: [ChatService , JwtService],
})
export class ChatModule {}
