import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { UpdatePasswordDto } from "./dto/update.password.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AuthGuard } from "src/comon/guards/auth.guards";
import { FileInterceptor } from "@nestjs/platform-express";
import { fileUploadOptions } from "src/comon/interceptors/file.interceptors";
import { SendRestoreOtpDto } from "./dto/sendRestoreOtp.dto";
import { RestoreAccountDto } from "./dto/restoreAcc.dto";
import { Types } from "mongoose";
import { RoleEnum } from "src/comon/enums/user.enums";
import { RolesGuard } from "src/comon/guards/role.guard";
import { Roles } from "src/comon/guards/roles.decorator";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}


  @UseGuards(AuthGuard)
  @Get("profile")
  getLoginUserData(@Req() req: any) {
    return this.userService.getLoginUserData(req.user._id);
  }
  @UseGuards(AuthGuard)
  @Get("profile/:userId")
  getProfileDataForAnotherUser(@Param("userId") userId: string) {
    return this.userService.getProfileDataForAnotherUser(userId);
  }
  @UseGuards(AuthGuard)
  @Patch("update-account")
  updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req: any) {
    const userId = req.user._id;
    return this.userService.updateUser(userId, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Patch("update-password")
  updatePassword(@Body() updatePasswordDto: UpdatePasswordDto, @Req() req: any) {
    const userId = req.user._id;
    return this.userService.updatePassword(userId, updatePasswordDto);
  }

  @UseGuards(AuthGuard)
  @Patch("upload-profile-pic")
  @UseInterceptors(FileInterceptor("file"))
  uploadProfilePic(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const userId = req.user._id;

    if (!file) {
      throw new BadRequestException("File is required");
    }

    return this.userService.uploadProfilePic(userId, file);
  }

   @UseGuards(AuthGuard)
  @Patch("upload-cover-pic")
  @UseInterceptors(FileInterceptor("file"))
  uploadCoverPic(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const userId = req.user._id;

    if (!file) {
      throw new BadRequestException("File is required");
    }

    return this.userService.uploadCoverPic(userId, file);
  }
  @UseGuards(AuthGuard)
@Delete("delete-profile-pic")
deleteProfilePic(@Req() req: any) {
  return this.userService.deleteProfilePic(req.user._id);
}

  @UseGuards(AuthGuard)
@Delete("delete-cover-pic")
deleteCoverPic(@Req() req: any) {
  return this.userService.deleteCoverPic(req.user._id);
}

@UseGuards(AuthGuard)
@Delete("soft-delete")
softDeleteAccount(@Req() req: any) {
  return this.userService.softDeleteAccount(req.user._id);
}
@Post("send-restore-otp")
sendRestoreOtp(@Body() sendRestoreOtpDto: SendRestoreOtpDto) {
  return this.userService.sendRestoreOtp(sendRestoreOtpDto);
}
@Patch("restore-account")
restoreAccount(@Body() restoreAccountDto: RestoreAccountDto) {
  return this.userService.restoreAccount(restoreAccountDto);
}


}
