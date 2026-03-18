import { IsEmail, IsString } from "class-validator";

export class GoogleSignupDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  googleId: string;

  @IsString()
  profilePic?: string;
}