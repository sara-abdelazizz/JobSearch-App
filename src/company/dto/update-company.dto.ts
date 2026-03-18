import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import { EmployeeRangeEnum } from "src/comon/enums/user.enums";

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @Length(3, 50)
  companyName?: string;

  @IsOptional()
  @IsString()
  @Length(3, 1000)
  description?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(EmployeeRangeEnum)
  numberOfEmployees?: EmployeeRangeEnum;

  @IsOptional()
  @IsEmail()
  companyEmail?: string;
}