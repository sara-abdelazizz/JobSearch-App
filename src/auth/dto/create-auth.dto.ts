import {
  IsDate,
  IsDateString,
  IsEmail,
  IsEmpty,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { GenderEnum, ProviderEnum } from "src/comon/enums/user.enums";

@ValidatorConstraint({ name: "IsAdult", async: false })
class IsAdult implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const dob = new Date(value);
    const now = new Date();

    if (dob >= now) return false;

    let age = now.getFullYear() - dob.getFullYear();

    const monthDiff = now.getMonth() - dob.getMonth();
    const dayDiff = now.getDate() - dob.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;

    return age >= 18;
  }

  defaultMessage(args: ValidationArguments) {
    return "DOB must be a date in the past and age ≥ 18 years";
  }
}

export class CreateUserDto {
  @IsString()
  @Length(3, 25)
  firstName: string;

  @IsString()
  @Length(3, 25)
  lastName: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  mobileNumber: string;

  @IsDateString({ strict: true })
  @Validate(IsAdult)
  DOB: string;

  
@IsOptional()
@IsEnum(GenderEnum)
gender?: GenderEnum;

@IsEnum(ProviderEnum)
provider: ProviderEnum;
}
