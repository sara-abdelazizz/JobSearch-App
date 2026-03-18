import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Company } from "src/DB/Models/company.model";
import { User } from "src/DB/Models/user.model";

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Company.name) private companyModel: Model<Company>,
  ) {}

  async banOrUnbanUser(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const isCurrentlyBanned = !!user.bannedAt;

    if (isCurrentlyBanned) {
      user.bannedAt = null;
      user.isBanned = false;
    } else {
      user.bannedAt = new Date();
      user.isBanned = true;
    }

    await user.save();

    return {
      message: isCurrentlyBanned
        ? "User unbanned successfully"
        : "User banned successfully",
      user,
    };
  }
  async banOrUnbanCompany(companyId: string) {
    const company = await this.companyModel.findById(companyId);

    if (!company) {
      throw new NotFoundException("Company not found");
    }

    const isCurrentlyBanned = !!company.bannedAt;

    if (isCurrentlyBanned) {
      company.bannedAt = null;
    } else {
      company.bannedAt = new Date();
    }

    await company.save();

    return {
      message: isCurrentlyBanned
        ? "Company unbanned successfully"
        : "Company banned successfully",
      company,
    };
  }
  async approveCompany(companyId: string) {
    const company = await this.companyModel.findById(companyId);

    if (!company) {
      throw new NotFoundException("Company not found");
    }

    if (company.approvedByAdmin) {
      throw new BadRequestException("Company already approved");
    }

    company.approvedByAdmin = true;

    await company.save();

    return {
      message: "Company approved successfully",
      company,
    };
  }
async getDashboardData() {
  const users = await this.userModel
    .find()
    .select("firstName lastName username email bannedAt")
    .lean();

  const companies = await this.companyModel
    .find()
    .select("companyName companyEmail approvedByAdmin bannedAt")
    .lean();

  return {
    users,
    companies,
  };
}
}
