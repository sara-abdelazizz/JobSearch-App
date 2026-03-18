import { Query, Resolver } from "@nestjs/graphql";
import { AdminService } from "./admin.service";
import { DashboardDataType } from "./graphql/dashboard.types"
import { UseGuards } from "@nestjs/common";
import { RoleEnum } from "src/comon/enums/user.enums";
import { AuthGuard } from "src/comon/guards/auth.guards";
import { RolesGuard } from "src/comon/guards/role.guard";
import { Roles } from "src/comon/guards/roles.decorator";

@Resolver()
@UseGuards(AuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN)
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  @Query(() => DashboardDataType)
  async dashboardData() {
    return this.adminService.getDashboardData();
  }
}