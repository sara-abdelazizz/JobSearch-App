import { Type } from "class-transformer";
import { IsIn, IsNumber, IsOptional, Min } from "class-validator";

export class GetJobApplicationsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  skip?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsIn(["createdAt", "-createdAt"])
  sort?: string = "-createdAt";
}