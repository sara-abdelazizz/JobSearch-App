import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import {
  JobLocationEnum,
  WorkingTimeEnum,
  SeniorityLevelEnum,
} from "src/comon/enums/user.enums";

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  jobTitle: string;

  @IsEnum(JobLocationEnum)
  jobLocation: JobLocationEnum;

  @IsEnum(WorkingTimeEnum)
  workingTime: WorkingTimeEnum;

  @IsEnum(SeniorityLevelEnum)
  seniorityLevel: SeniorityLevelEnum;

  @IsString()
  @IsNotEmpty()
  @Length(10, 2000)
  jobDescription: string;

  @IsArray()
@IsString({ each: true })
@IsNotEmpty({ each: true })
technicalSkills: string[];

  @IsArray()
  @IsString({ each: true })
  softSkills: string[];

  @IsMongoId()
  companyId: string;

}
