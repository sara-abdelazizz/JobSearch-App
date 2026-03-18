import { Module } from "@nestjs/common";
import { CompanyService } from "./company.service";
import { CompanyController } from "./company.controller";
import { CompanyModel } from "src/DB/Models/company.model";
import { UserModel } from "src/DB/Models/user.model";
import { JwtService } from "@nestjs/jwt";
import { CloudinaryService } from "src/comon/service/cloudinary.service";

@Module({
  imports: [CompanyModel, UserModel],
  controllers: [CompanyController],
  providers: [CompanyService , JwtService , CloudinaryService],
})
export class CompanyModule {}
