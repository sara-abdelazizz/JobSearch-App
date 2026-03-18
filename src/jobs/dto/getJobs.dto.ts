import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import {
  JobLocationEnum,
  SeniorityLevelEnum,
  WorkingTimeEnum,
} from "src/comon/enums/user.enums";
import { Type } from "class-transformer";

export class GetJobsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

 
  @IsOptional()
  @IsString()
  sort?: string;

  
  @IsOptional()
  @IsEnum(WorkingTimeEnum)
  workingTime?: WorkingTimeEnum;

  @IsOptional()
  @IsEnum(JobLocationEnum)
  jobLocation?: JobLocationEnum;

  @IsOptional()
  @IsEnum(SeniorityLevelEnum)
  seniorityLevel?: SeniorityLevelEnum;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  technicalSkills?: string;
}