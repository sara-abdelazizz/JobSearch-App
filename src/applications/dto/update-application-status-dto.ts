import { IsEnum } from "class-validator";
import { ApplicationStatusEnum } from "src/comon/enums/user.enums";

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatusEnum)
  status: ApplicationStatusEnum;
}