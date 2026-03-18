import { IsMongoId, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

export class GetCompanyJobsDto {
  @IsOptional()
  @IsMongoId()
  companyId?: string;

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
  @IsString()
  search?: string;
}