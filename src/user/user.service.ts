import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "src/DB/Models/user.model";
import { UpdatePasswordDto } from "./dto/update.password.dto";
import { compare, hash } from "src/comon/hashing/hash";
import { CloudinaryService } from "src/comon/service/cloudinary.service";
import { Otp } from "src/DB/Models/otp.model";
import { SendRestoreOtpDto } from "./dto/sendRestoreOtp.dto";
import { OtpEnum } from "src/comon/enums/user.enums";
import { genereteOTP } from "src/comon/otp.util";
import { RestoreAccountDto } from "./dto/restoreAcc.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Otp.name) private otpModel: Model<Otp>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  async updateUser(userId: Types.ObjectId, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException("User not found");

    const { firstName, lastName, mobileNumber, DOB, gender } = updateUserDto;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (DOB) user.DOB = new Date(DOB);
    if (gender) user.gender = gender;

    if (mobileNumber) {
      user.mobileNumber = mobileNumber;
    }

    await user.save();

    return {
      message: "Account updated successfully",
      user,
    };
  }

  async getLoginUserData(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException("User not found");


    return {
      message: "User account fetched successfully",
      user,
    };
  }

  async getProfileDataForAnotherUser(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select("username mobileNumber profilePic coverPic");

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return {
      message: "User profile fetched successfully",
      user,
    };
  }
  async updatePassword(
    userId: Types.ObjectId,
    updatePasswordDto: UpdatePasswordDto,
  ) {
    const { oldPassword, newPassword, confirmPassword } = updatePasswordDto;

    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const isMatched = await compare(oldPassword, user.password);
    if (!isMatched) {
      throw new BadRequestException("Old password is incorrect");
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestException(
        "New password and confirm password do not match",
      );
    }

    if (await compare(newPassword, user.password)) {
      throw new BadRequestException(
        "New password must be different from old password",
      );
    }

    user.password = newPassword;
    user.changeCredentialsTime = new Date();

    await user.save();

    return {
      message: "Password updated successfully",
    };
  }
  async uploadProfilePic(userId: Types.ObjectId, file: Express.Multer.File) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!file) {
      throw new BadRequestException("File is required");
    }

    if (user.profilePic?.public_id) {
      await this.cloudinaryService.deleteFromCloudinary(
        user.profilePic.public_id,
      );
    }

    const uploaded: any = await this.cloudinaryService.uploadToCloudinary(
      file.buffer,
      "job-search-app/user/profile-pics",
    );

    user.profilePic = {
      secure_url: uploaded.secure_url,
      public_id: uploaded.public_id,
    };

    await user.save();

    return {
      message: "Profile picture uploaded successfully",
      profilePic: user.profilePic,
    };
  }
  async uploadCoverPic(userId: Types.ObjectId, file: Express.Multer.File) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!file) {
      throw new BadRequestException("File is required");
    }

    if (!file.buffer) {
      throw new BadRequestException("File buffer is missing");
    }

    if (user.coverPic?.public_id) {
      await this.cloudinaryService.deleteFromCloudinary(
        user.coverPic.public_id,
      );
    }

    const uploaded: any = await this.cloudinaryService.uploadToCloudinary(
      file.buffer,
      "job-search-app/user/cover-pics",
    );

    user.coverPic = {
      secure_url: uploaded.secure_url,
      public_id: uploaded.public_id,
    };

    await user.save();

    return {
      message: "Cover picture uploaded successfully",
      coverPic: user.coverPic,
    };
  }
  async deleteProfilePic(userId: Types.ObjectId) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.profilePic?.public_id) {
      throw new BadRequestException("Profile picture not found");
    }

    await this.cloudinaryService.deleteFromCloudinary(
      user.profilePic.public_id,
    );

    user.profilePic = null;
    await user.save();

    return {
      message: "Profile picture deleted successfully",
    };
  }
  async deleteCoverPic(userId: Types.ObjectId) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.coverPic?.public_id) {
      throw new BadRequestException("Cover picture not found");
    }

    await this.cloudinaryService.deleteFromCloudinary(user.coverPic.public_id);

    user.coverPic = null;

    await user.save();

    return {
      message: "Cover picture deleted successfully",
    };
  }
  async softDeleteAccount(userId: Types.ObjectId) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    user.isDeleted = true;
    user.deletedAt = new Date();

    await user.save();

    return {
      message: "Account soft deleted successfully",
    };
  }
  async sendRestoreOtp(sendRestoreOtpDto: SendRestoreOtpDto) {
    const { email } = sendRestoreOtpDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.isDeleted) {
      throw new BadRequestException("Account is already active");
    }

    const otpCode = genereteOTP();

    await this.otpModel.create({
      code: otpCode,
      type: OtpEnum.RESTORE_ACCOUNT,
      createdBy: user._id,
      expiredAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    return {
      message: "Restore OTP sent successfully",
    };
  }
  async restoreAccount(restoreAccountDto: RestoreAccountDto) {
    const { email, otp } = restoreAccountDto;

    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.isDeleted) {
      throw new BadRequestException("Account is already active");
    }

    const storedOtp = await this.otpModel.findOne({
      createdBy: user._id,
      type: OtpEnum.RESTORE_ACCOUNT,
    });

    if (!storedOtp) {
      throw new NotFoundException("OTP not found");
    }

    if (storedOtp.expiredAt < new Date()) {
      throw new BadRequestException("OTP expired");
    }

    const isMatched = await compare(otp, storedOtp.code);

    if (!isMatched) {
      throw new BadRequestException("Invalid OTP");
    }

    user.isDeleted = false;
    user.deletedAt = null;

    await user.save();
    await this.otpModel.deleteOne({ _id: storedOtp._id });

    return {
      message: "Account restored successfully",
    };
  }
}
