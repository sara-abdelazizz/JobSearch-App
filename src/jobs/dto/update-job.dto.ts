import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import {
  JobLocationEnum,
  SeniorityLevelEnum,
  WorkingTimeEnum,
} from "src/comon/enums/user.enums";

export class UpdateJobDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  jobTitle?: string;

  @IsOptional()
  @IsEnum(JobLocationEnum)
  jobLocation?: JobLocationEnum;

  @IsOptional()
  @IsEnum(WorkingTimeEnum)
  workingTime?: WorkingTimeEnum;

  @IsOptional()
  @IsEnum(SeniorityLevelEnum)
  seniorityLevel?: SeniorityLevelEnum;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  jobDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technicalSkills?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  softSkills?: string[];
  
}