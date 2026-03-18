import { IsOptional, IsString, IsDateString, IsEnum } from "class-validator";
import { GenderEnum } from "src/comon/enums/user.enums";


export class UpdateUserDto {
    @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  mobileNumber: string;

  @IsOptional()
  @IsDateString()
  DOB: string;

  @IsOptional()
  @IsEnum(GenderEnum)
  gender: GenderEnum;
}
