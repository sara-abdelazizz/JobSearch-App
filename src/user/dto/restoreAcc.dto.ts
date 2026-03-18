import { IsEmail, IsString, Length } from "class-validator";

export class RestoreAccountDto {
  @IsEmail()
  email: string;

  @IsString()
  otp: string;
}