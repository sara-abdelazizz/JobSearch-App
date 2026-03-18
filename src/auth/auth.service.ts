import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-auth.dto";

import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { HUserDocument, User, UserModel } from "src/DB/Models/user.model";
import { genereteOTP } from "src/comon/otp.util";
import { HOtpDocument, Otp } from "src/DB/Models/otp.model";
import { OtpEnum, ProviderEnum } from "src/comon/enums/user.enums";
import { ConfirmEmailDto } from "./dto/confirm-email.dto";
import { compare, hash } from "src/comon/hashing/hash";
import { LoginDto } from "./dto/login.dto";
import { randomUUID } from "node:crypto";
import { JwtService } from "@nestjs/jwt";
import { GoogleSignupDto } from "./dto/signup.google.dto";
import { GoogleLoginDto } from "./dto/login.google.dto";
import { generateTokens } from "src/comon/utils/token/token";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<HUserDocument>,
    @InjectModel(Otp.name) private otpModel: Model<HOtpDocument>,
    private jwtService: JwtService,
  ) {}
  async createOtp(userId: Types.ObjectId) {
    await this.otpModel.create({
      createdBy: userId,
      code: genereteOTP(),
      expiredAt: new Date(Date.now() + 10 * 60 * 1000),
      type: OtpEnum.EMAIL_VERIFICATION,
    });
  }

  async resendOtp(resendOtpDto: { email: string }) {
    const { email } = resendOtpDto;

    const user = await this.userModel
      .findOne({
        email,
        confirmEmail: { $exists: false },
        isConfirmed: false,
      })
      .populate([{ path: "otp", match: { type: OtpEnum.EMAIL_VERIFICATION } }]);

    if (!user) throw new NotFoundException("User Not Found");

    await this.otpModel.deleteMany({
      createdBy: user._id,
      type: OtpEnum.EMAIL_VERIFICATION,
      expiredAt: { $lt: new Date() },
    });

    const existingOtp = await this.otpModel.findOne({
      createdBy: user._id,
      type: OtpEnum.EMAIL_VERIFICATION,
      expiredAt: { $gt: new Date() },
    });

    if (existingOtp) throw new ConflictException("Otp Already Exists");

    await this.createOtp(user._id);

    return { message: "Otp Sent Successfully" };
  }

  async signup(createUserDto: CreateUserDto) {
    const checkUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (checkUser)
      throw new ConflictException("User already exists with this email");
    const user = await this.userModel.create(createUserDto);
    user.updatedBy = user._id;
    await user.save();
    await this.createOtp(user._id);
    return user;
  }
  async confirmEmail(confirmEmailDto: ConfirmEmailDto) {
    const { email, otp } = confirmEmailDto;
    const user = await this.userModel
      .findOne({ email, confirmEmail: { $exists: false } })
      .populate([{ path: "otp", match: { type: OtpEnum.EMAIL_VERIFICATION } }]);
    if (!user)
      throw new NotFoundException(
        "No user found with this email or email already confirmed",
      );
    if (!user.otp?.length)
      throw new NotFoundException(
        "No OTP found for this user, please request a new one",
      );
    if (user.otp[0].expiredAt < new Date())
      throw new BadRequestException("OTP expired");
    if (user.otp[0].type !== OtpEnum.EMAIL_VERIFICATION)
      throw new BadRequestException("Invalid OTP type");
    if (!(await compare(otp, user.otp[0].code)))
      throw new BadRequestException("OTP not valid");

    await this.userModel.updateOne(
      { _id: user._id },
      {
        $set: { confirmEmail: new Date(), isConfirmed: true },
        $inc: { __v: 1 },
      },
    );
    await this.otpModel.deleteMany({
      createdBy: user._id,
      type: OtpEnum.EMAIL_VERIFICATION,
    });
    return { message: "Email confirmed successfully" };
  }
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({
      email,
      confirmEmail: { $exists: true },
      provider: ProviderEnum.SYSTEM,
      isDeleted: false,
    });
    if (!user) throw new NotFoundException("User Not Found");
    if (!user.isConfirmed)
      throw new BadRequestException("Please confirm your email first");

    if (!(await compare(password, user.password)))
      throw new BadRequestException("Invalid email or password");
    if (user.isBanned) {
  throw new BadRequestException("This account is banned");
}

    const jwtid = randomUUID();

    const tokens = await generateTokens(
      this.jwtService,
      { id: user._id, email: user.email },
      process.env.TOKEN_ACCESS_ADMIN_SECRET!,
      process.env.TOKEN_REFRESH_ADMIN_SECRET!,
      Number(process.env.ACCESS_TOKEN_EXPIRE_IN),
      Number(process.env.REFRESH_TOKEN_EXPIRE_IN),
    );

    return {
      message: "User logged in successfully",
      credentials: tokens,
    };
  }

async signupWithGoogle(googleSignupDto: GoogleSignupDto) {
  const { email, firstName, lastName, googleId, profilePic } =
    googleSignupDto;

  const checkUser = await this.userModel.findOne({
    email,
    provider: ProviderEnum.GOOGLE,
  });

  if (checkUser) {
    throw new ConflictException("User already exists, please login");
  }

  const user = await this.userModel.create({
    email,
    firstName,
    lastName,
    provider: ProviderEnum.GOOGLE,
    isConfirmed: true,
    profilePic: profilePic
      ? { secure_url: profilePic, public_id: googleId }
      : undefined,
  });

  const tokens = await generateTokens(
    this.jwtService,
    { id: user._id, email: user.email },
    process.env.TOKEN_ACCESS_ADMIN_SECRET!,
    process.env.TOKEN_REFRESH_ADMIN_SECRET!,
    Number(process.env.ACCESS_TOKEN_EXPIRE_IN),
    Number(process.env.REFRESH_TOKEN_EXPIRE_IN),
  );

  return {
    message: "User signed up with Google successfully",
    credentials: tokens,
    user: {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePic: user.profilePic,
    },
  };
}
 async loginWithGoogle(googleLoginDto: GoogleLoginDto) {
  const user = await this.userModel.findOne({
    email: googleLoginDto.email,
    provider: ProviderEnum.GOOGLE,
  });

  if (!user) {
    throw new NotFoundException(
      "No user found with this Google account. Please signup first",
    );
  }

  const jwtid = randomUUID();

  const tokens = await generateTokens(
    this.jwtService,
    { id: user._id, email: user.email },
    process.env.TOKEN_ACCESS_ADMIN_SECRET!,
    process.env.TOKEN_REFRESH_ADMIN_SECRET!,
    Number(process.env.ACCESS_TOKEN_EXPIRE_IN),
    Number(process.env.REFRESH_TOKEN_EXPIRE_IN),
  );

  return {
    message: "User logged in with Google successfully",
    credentials: tokens,
    user: {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePic: user.profilePic,
    },
  };
}

  async requestForgotPasswordOtp(body: { email: string }) {
    const { email } = body;

    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException("User not found");

    await this.otpModel.deleteMany({
      createdBy: user._id,
      type: OtpEnum.PASSWORD_RESET,
    });

    const otpCode = genereteOTP();
    await this.otpModel.create({
      createdBy: user._id,
      code: otpCode,
      expiredAt: new Date(Date.now() + 10 * 60 * 1000),
      type: OtpEnum.PASSWORD_RESET,
    });

    return { message: "OTP sent successfully" };
  }
  async resetPassword(body: {
    email: string;
    otp: string;
    newPassword: string;
  }) {
    const { email, otp, newPassword } = body;

    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException("User not found");

    const passwordResetOtp = await this.otpModel.findOne({
      createdBy: user._id,
      type: OtpEnum.PASSWORD_RESET,
      expiredAt: { $gt: new Date() },
    });
    if (!passwordResetOtp)
      throw new NotFoundException(
        "No valid OTP found, please request a new one",
      );
    if (!(await compare(otp, passwordResetOtp.code)))
      throw new BadRequestException("Invalid OTP");
    user.password = newPassword;
    user.changeCredentialsTime = new Date();
    await user.save();
    await this.otpModel.deleteMany({
      createdBy: user._id,
      type: OtpEnum.PASSWORD_RESET,
    });
    return { message: "Password updated successfully" };
  }
  async refreshToken(refreshToken: string) {
    const decoded = this.jwtService.decode(refreshToken) as {
      id: string;
      iat: number;
    };
    if (!decoded?.id || !decoded?.iat)
      throw new BadRequestException("Invalid token");

    const user = await this.userModel.findById(decoded.id);
    if (!user) throw new NotFoundException("User not found");

    if (user.changeCredentialsTime?.getTime() > decoded.iat * 1000)
      throw new BadRequestException("Token invalid due to credential change");

    const tokens = await generateTokens(
      this.jwtService,
      { id: user._id, email: user.email },
      process.env.TOKEN_ACCESS_ADMIN_SECRET!,
      process.env.TOKEN_REFRESH_ADMIN_SECRET!,
      Number(process.env.ACCESS_TOKEN_EXPIRE_IN),
      Number(process.env.REFRESH_TOKEN_EXPIRE_IN),
    );

    return { accessToken: tokens.accessToken };
  }
}
