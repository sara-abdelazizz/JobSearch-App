import {
  Post,
  Param,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Controller,
  Body,
  Patch,
} from "@nestjs/common";
import { ApplicationsService } from "./applications.service";

import { FileInterceptor } from "@nestjs/platform-express";
import { RoleEnum } from "src/comon/enums/user.enums";
import { AuthGuard } from "src/comon/guards/auth.guards";
import { RolesGuard } from "src/comon/guards/role.guard";
import { Roles } from "src/comon/guards/roles.decorator";
import { UpdateApplicationStatusDto } from "./dto/update-application-status-dto";

@Controller("jobs")
export class ApplicationsController {
  constructor(private readonly applicationService: ApplicationsService) {}

  @Post(":jobId/apply")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.USER)
  @UseInterceptors(FileInterceptor("userCV"))
  applyToJob(
    @Param("jobId") jobId: string,
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.applicationService.applyToJob(jobId, req.user._id, file);
  }

  @Patch("applications/:applicationId/status")
@UseGuards(AuthGuard)
updateApplicationStatus(
  @Param("applicationId") applicationId: string,
  @Req() req: any,
  @Body() body: UpdateApplicationStatusDto,
) {
  return this.applicationService.updateApplicationStatus(
    applicationId,
    req.user._id,
    body.status as any,
  );
}


}
