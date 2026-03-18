import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;

  @IsString()
  @MinLength(6)
  confirmPassword: string;
}