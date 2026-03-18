import { IsEmail } from "class-validator";

export class SendRestoreOtpDto {
  @IsEmail()
  email: string;
}