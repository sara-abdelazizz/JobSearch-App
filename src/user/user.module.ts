import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserModel } from 'src/DB/Models/user.model';
import { JwtService } from '@nestjs/jwt';
import { CloudinaryService } from 'src/comon/service/cloudinary.service';
import { OtpModel } from 'src/DB/Models/otp.model';

@Module({
  imports: [UserModel , OtpModel],
  controllers: [UserController],
  providers: [UserService , JwtService , CloudinaryService],
})
export class UserModule {}
