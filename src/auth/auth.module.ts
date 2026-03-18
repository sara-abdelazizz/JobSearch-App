import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModel } from 'src/DB/Models/user.model';
import { OtpModel } from 'src/DB/Models/otp.model';
import { JwtService } from '@nestjs/jwt';
import { OtpCronService } from 'src/comon/crons/otp.crons.srvice';


@Module({
  imports:[UserModel , OtpModel ],
  controllers: [AuthController],
  providers: [AuthService , JwtService ,OtpCronService],
})
export class AuthModule {}
