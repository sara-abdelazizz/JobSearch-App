import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { UserModel } from "src/DB/Models/user.model";
import { JwtService } from "@nestjs/jwt";
import { CompanyModel } from "src/DB/Models/company.model";
import { AdminResolver } from "./admin.resolver";

@Module({
  imports: [UserModel ,CompanyModel],
  controllers: [AdminController],
  providers: [AdminService , JwtService , AdminResolver],
})
export class AdminModule {}
