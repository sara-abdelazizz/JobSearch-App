import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { CompanyService } from "./company.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { AuthGuard } from "src/comon/guards/auth.guards";
import { Roles } from "src/comon/guards/roles.decorator";
import { RolesGuard } from "src/comon/guards/role.guard";
import { RoleEnum } from "src/comon/enums/user.enums";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("company")
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @UseGuards(AuthGuard)
  addCompany(@Body() createCompanyDto: CreateCompanyDto, @Req() req: any) {
    return this.companyService.addCompany(createCompanyDto, req.user._id);
  }

  @Patch(":companyId")
  @UseGuards(AuthGuard)
  updateCompany(
    @Param("companyId") companyId: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Req() req: any,
  ) {
    return this.companyService.updateCompany(
      companyId,
      updateCompanyDto,
      req.user._id,
    );
  }

  @Delete(":companyId")
  @UseGuards(AuthGuard)
  softDeleteCompany(@Param("companyId") companyId: string, @Req() req: any) {
    return this.companyService.softDeleteCompany(
      companyId,
      req.user._id,
      req.user.role,
    );
  }

  @Patch(":companyId/restore")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  restoreCompany(@Param("companyId") companyId: string) {
    return this.companyService.restoreCompany(companyId);
  }

  @Get("search")
  searchCompany(@Query("name") name: string) {
    return this.companyService.searchCompanyByName(name);
  }

  @Get(":companyId")
  getSpecificCompanyWithJobs(@Param("companyId") companyId: string) {
    return this.companyService.getSpecificCompanyWithJobs(companyId);
  }

  @Patch(":companyId/logo")
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor("logo"))
  uploadCompanyLogo(
    @Param("companyId") companyId: string,
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.companyService.uploadCompanyLogo(companyId, req.user._id, file);
  }

  @Patch(":companyId/cover-pic")
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor("coverPic"))
  uploadCompanyCoverPic(
    @Param("companyId") companyId: string,
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.companyService.uploadCompanyCoverPic(
      companyId,
      req.user._id,
      file,
    );
  }

  @Delete(":companyId/logo")
  @UseGuards(AuthGuard)
  deleteCompanyLogo(@Param("companyId") companyId: string, @Req() req: any) {
    return this.companyService.deleteCompanyLogo(companyId, req.user._id);
  }

  @Delete(":companyId/cover-pic")
  @UseGuards(AuthGuard)
  deleteCompanyCoverPic(
    @Param("companyId") companyId: string,
    @Req() req: any,
  ) {
    return this.companyService.deleteCompanyCoverPic(companyId, req.user._id);
  }

  @Patch(":companyId/add-hr/:hrId")
@UseGuards(AuthGuard)
addHRToCompany(
  @Param("companyId") companyId: string,
  @Param("hrId") hrId: string,
  @Req() req: any,
) {
  return this.companyService.addHRToCompany(
    companyId,
    hrId,
    req.user._id,
  );
}
@Patch(":companyId/legal-attachment")
@UseGuards(AuthGuard)
@UseInterceptors(FileInterceptor("legalAttachment"))
uploadLegalAttachment(
  @Param("companyId") companyId: string,
  @Req() req: any,
  @UploadedFile() file: Express.Multer.File,
) {
  return this.companyService.uploadLegalAttachment(
    companyId,
    req.user._id,
    file,
  );
}
}
