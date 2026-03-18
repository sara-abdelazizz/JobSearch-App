import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Company } from "src/DB/Models/company.model";
import { Model, Types } from "mongoose";
import { User } from "src/DB/Models/user.model";
import { CloudinaryService } from "src/comon/service/cloudinary.service";
import { RoleEnum } from "src/comon/enums/user.enums";

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<Company>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  async addCompany(createCompanyDto: CreateCompanyDto, userId: Types.ObjectId) {
    const { companyName, companyEmail } = createCompanyDto;

    const companyExists = await this.companyModel.findOne({
      $or: [{ companyName }, { companyEmail }],
    });

    if (companyExists) {
      if (companyExists.companyName === companyName) {
        throw new ConflictException("Company name already exists");
      }

      if (companyExists.companyEmail === companyEmail) {
        throw new ConflictException("Company email already exists");
      }
    }

    const company = await this.companyModel.create({
      ...createCompanyDto,
      createdBy: userId,
    });

    return {
      message: "Company added successfully",
      company,
    };
  }
  async updateCompany(
    companyId: string,
    updateCompanyDto: UpdateCompanyDto,
    userId: Types.ObjectId,
  ) {
    const company = await this.companyModel.findById(companyId);
    if (!company) {
      throw new NotFoundException("Company not found");
    }

    if (company.createdBy.toString() !== userId.toString()) {
      throw new UnauthorizedException(
        "Only the company owner can update company data",
      );
    }

    if ((updateCompanyDto as any).legalAttachment) {
      throw new BadRequestException("legal attachment cannot be updated here");
    }

    if (
      updateCompanyDto.companyName &&
      updateCompanyDto.companyName !== company.companyName
    ) {
      const nameExists = await this.companyModel.findOne({
        companyName: updateCompanyDto.companyName,
        _id: { $ne: companyId },
      });

      if (nameExists) {
        throw new ConflictException("Company name already exists");
      }
    }

    if (
      updateCompanyDto.companyEmail &&
      updateCompanyDto.companyEmail !== company.companyEmail
    ) {
      const emailExists = await this.companyModel.findOne({
        companyEmail: updateCompanyDto.companyEmail,
        _id: { $ne: companyId },
      });

      if (emailExists) {
        throw new ConflictException("Company email already exists");
      }
    }

    if (updateCompanyDto.companyName !== undefined) {
      company.companyName = updateCompanyDto.companyName;
    }

    if (updateCompanyDto.description !== undefined) {
      company.description = updateCompanyDto.description;
    }

    if (updateCompanyDto.industry !== undefined) {
      company.industry = updateCompanyDto.industry;
    }

    if (updateCompanyDto.address !== undefined) {
      company.address = updateCompanyDto.address;
    }

    if (updateCompanyDto.numberOfEmployees !== undefined) {
      company.numberOfEmployees = updateCompanyDto.numberOfEmployees;
    }

    if (updateCompanyDto.companyEmail !== undefined) {
      company.companyEmail = updateCompanyDto.companyEmail;
    }
    await company.save();

    return {
      message: "Company updated successfully",
      company,
    };
  }
  async softDeleteCompany(
    companyId: string,
    userId: Types.ObjectId,
    role: string,
  ) {
    const company = await this.companyModel.findById(companyId);

    if (!company) {
      throw new NotFoundException("Company not found");
    }

    const isOwner = company.createdBy.toString() === userId.toString();
    const isAdmin = role === RoleEnum.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new UnauthorizedException(
        "Only the company owner or admin can delete this company",
      );
    }

    if (company.deletedAt) {
      throw new BadRequestException("Company already deleted");
    }

    company.isDeleted = true;
    company.deletedAt = new Date();
    await company.save();

    return {
      message: "Company soft deleted successfully",
    };
  }
  async restoreCompany(companyId: string) {
    const company = await this.companyModel.findById(companyId);

    if (!company) {
      throw new NotFoundException("Company not found");
    }

    if (!company.isDeleted) {
      throw new BadRequestException("Company is not deleted");
    }

    company.isDeleted = false;
    company.deletedAt = null;

    await company.save();

    return {
      message: "Company restored successfully",
    };
  }
  async getSpecificCompanyWithJobs(companyId: string) {
    if (!Types.ObjectId.isValid(companyId)) {
      throw new BadRequestException("Invalid company id");
    }

    const company = await this.companyModel
      .findById(companyId)
      .populate("jobs");

    if (!company) {
      throw new NotFoundException("Company not found");
    }

    return {
      message: "Company fetched successfully",
      company,
    };
  }
  async searchCompanyByName(name: string) {
    if (!name) {
      throw new BadRequestException("Company name is required");
    }
    const companies = await this.companyModel.find({
      companyName: { $regex: name, $options: "i" },
    });

    return {
      message: "Companies fetched successfully",
      companies,
    };
  }
  async uploadCompanyLogo(
    companyId: string,
    userId: Types.ObjectId,
    file: Express.Multer.File,
  ) {
    const company = await this.companyModel.findById(companyId);

    if (!company) {
      throw new NotFoundException("Company not found");
    }

    if (company.isDeleted) {
      throw new BadRequestException("Company is deleted");
    }

    if (!file) {
      throw new BadRequestException("File is required");
    }

    if (!file.mimetype.startsWith("image/")) {
      throw new BadRequestException("Only image files are allowed");
    }

    if (company.createdBy.toString() !== userId.toString()) {
      throw new UnauthorizedException(
        "Only company owner can upload company logo",
      );
    }

    if (company.logo?.public_id) {
      await this.cloudinaryService.deleteFromCloudinary(company.logo.public_id);
    }

    const uploaded: any = await this.cloudinaryService.uploadToCloudinary(
      file.buffer,
      "job-search-app/company/logo",
    );

    company.logo = {
      secure_url: uploaded.secure_url,
      public_id: uploaded.public_id,
    };

    await company.save();

    return {
      message: "Company logo uploaded successfully",
      logo: company.logo,
    };
  }
  async uploadCompanyCoverPic(
    companyId: string,
    userId: Types.ObjectId,
    file: Express.Multer.File,
  ) {
    const company = await this.companyModel.findById(companyId);

    if (!company) {
      throw new NotFoundException("Company not found");
    }

    if (company.isDeleted) {
      throw new BadRequestException("Company is deleted");
    }

    if (!file) {
      throw new BadRequestException("File is required");
    }

    if (!file.mimetype.startsWith("image/")) {
      throw new BadRequestException("Only image files are allowed");
    }

    if (company.createdBy.toString() !== userId.toString()) {
      throw new UnauthorizedException(
        "Only company owner can upload company cover picture",
      );
    }

    if (company.coverPic?.public_id) {
      await this.cloudinaryService.deleteFromCloudinary(
        company.coverPic.public_id,
      );
    }

    const uploaded: any = await this.cloudinaryService.uploadToCloudinary(
      file.buffer,
      "job-search-app/company/cover-pics",
    );

    company.coverPic = {
      secure_url: uploaded.secure_url,
      public_id: uploaded.public_id,
    };

    await company.save();

    return {
      message: "Company cover picture uploaded successfully",
      coverPic: company.coverPic,
    };
  }
  async deleteCompanyLogo(companyId: string, userId: Types.ObjectId) {
    const company = await this.companyModel.findById(companyId);

    if (!company) {
      throw new NotFoundException("Company not found");
    }

    if (company.isDeleted) {
      throw new BadRequestException("Company is deleted");
    }

    if (company.createdBy.toString() !== userId.toString()) {
      throw new UnauthorizedException(
        "Only company owner can delete company logo",
      );
    }

    if (!company.logo?.public_id) {
      throw new BadRequestException("Company logo not found");
    }

    await this.cloudinaryService.deleteFromCloudinary(company.logo.public_id);

    company.logo = null;

    await company.save();

    return {
      message: "Company logo deleted successfully",
    };
  }
  async deleteCompanyCoverPic(companyId: string, userId: Types.ObjectId) {
    const company = await this.companyModel.findById(companyId);

    if (!company) {
      throw new NotFoundException("Company not found");
    }

    if (company.isDeleted) {
      throw new BadRequestException("Company is deleted");
    }

    if (company.createdBy.toString() !== userId.toString()) {
      throw new UnauthorizedException(
        "Only company owner can delete company cover picture",
      );
    }

    if (!company.coverPic?.public_id) {
      throw new BadRequestException("Company cover picture not found");
    }

    await this.cloudinaryService.deleteFromCloudinary(
      company.coverPic.public_id,
    );

    company.coverPic = null;

    await company.save();

    return {
      message: "Company cover picture deleted successfully",
    };
  }
  async addHRToCompany(
  companyId: string,
  hrId: string,
  userId: Types.ObjectId,
) {
  const company = await this.companyModel.findById(companyId);

  if (!company) {
    throw new NotFoundException("Company not found");
  }

  if (company.isDeleted) {
    throw new BadRequestException("Company is deleted");
  }

  if (company.createdBy.toString() !== userId.toString()) {
    throw new UnauthorizedException(
      "Only company owner can add HRs",
    );
  }

  if (!Types.ObjectId.isValid(hrId)) {
    throw new BadRequestException("Invalid HR id");
  }

  const hr = await this.userModel.findById(hrId);
  if (!hr) {
    throw new NotFoundException("HR user not found");
  }

  const isAlreadyHR = company.HRs.some(
    (id) => id.toString() === hrId.toString(),
  );

  if (isAlreadyHR) {
    throw new ConflictException("User already added as HR");
  }

  company.HRs.push(hr._id as Types.ObjectId);
  await company.save();

  return {
    message: "HR added successfully",
    company,
  };
}
async uploadLegalAttachment(
  companyId: string,
  userId: Types.ObjectId,
  file: Express.Multer.File,
) {
  const company = await this.companyModel.findById(companyId);

  if (!company) {
    throw new NotFoundException("Company not found");
  }

  if (company.isDeleted) {
    throw new BadRequestException("Company is deleted");
  }

  if (company.createdBy.toString() !== userId.toString()) {
    throw new UnauthorizedException(
      "Only company owner can upload legal attachment",
    );
  }

  if (!file) {
    throw new BadRequestException("File is required");
  }

  const isValidType =
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf";

  if (!isValidType) {
    throw new BadRequestException("Only image or pdf files are allowed");
  }

  if (company.legalAttachment?.public_id) {
    await this.cloudinaryService.deleteFromCloudinary(
      company.legalAttachment.public_id,
    );
  }

  const uploaded: any = await this.cloudinaryService.uploadToCloudinary(
    file.buffer,
    "job-search-app/company/legal-attachments",
  );

  company.legalAttachment = {
    secure_url: uploaded.secure_url,
    public_id: uploaded.public_id,
  };

  await company.save();

  return {
    message: "Legal attachment uploaded successfully",
    legalAttachment: company.legalAttachment,
  };
}
}
