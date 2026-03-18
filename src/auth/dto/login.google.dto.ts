import { IsEmail, IsString } from "class-validator";

export class GoogleLoginDto {
  @IsEmail()
  email: string;


}
