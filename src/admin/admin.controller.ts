import { Controller, Param, Patch, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AuthGuard } from "src/comon/guards/auth.guards";
import { RolesGuard } from "src/comon/guards/role.guard";
import { Roles } from "src/comon/guards/roles.decorator";
import { RoleEnum } from "src/comon/enums/user.enums";

@Controller("admin")
@UseGuards(AuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch("user/:userId/ban")
  banOrUnbanUser(@Param("userId") userId: string) {
    return this.adminService.banOrUnbanUser(userId);
  }
  @Patch("company/:companyId/ban")
  banOrUnbanCompany(@Param("companyId") companyId: string) {
    return this.adminService.banOrUnbanCompany(companyId);
  }
  @Patch("company/:companyId/approve")
  approveCompany(@Param("companyId") companyId: string) {
    return this.adminService.approveCompany(companyId);
  }
}
