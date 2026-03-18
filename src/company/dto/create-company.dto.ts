import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { EmployeeRangeEnum } from "src/comon/enums/user.enums";


export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  industry: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEnum(EmployeeRangeEnum)
  numberOfEmployees: EmployeeRangeEnum;

  @IsEmail()
  @IsNotEmpty()
  companyEmail: string;
}
