import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "./dto/create-auth.dto";

import { LoggerInterceptor } from "src/comon/interceptors/logger.interceptors";
import { ResponseInterceptor } from "src/comon/interceptors/response.interceptor";
import { ConfirmEmailDto } from "./dto/confirm-email.dto";
import { LoginDto } from "./dto/login.dto";
import { GoogleSignupDto } from "./dto/signup.google.dto";
import { GoogleLoginDto } from "./dto/login.google.dto";

@UseInterceptors(ResponseInterceptor, LoggerInterceptor)

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/signup")
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }
    @Post("/resend-otp")
  resendOtp(@Body() resendOtp: any) {
    return this.authService.resendOtp(resendOtp);
  }

  @Patch("/confirm-email")
  confirmEmail(@Body() confirmEmailDto: ConfirmEmailDto) {
    return this.authService.confirmEmail(confirmEmailDto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  
   @Post("google-signup")
  signupWithGoogle(@Body() googleSignupDto: GoogleSignupDto) {
    return this.authService.signupWithGoogle(googleSignupDto);
  }

 @Post("google-login")
loginWithGoogle(@Body() googleLoginDto: GoogleLoginDto) {
  return this.authService.loginWithGoogle(googleLoginDto);
}
@Post("forgot-password/request-otp")
async requestForgotPasswordOtp(@Body() body: { email: string }) {
  return this.authService.requestForgotPasswordOtp(body);
}

@Post("forgot-password/send-otp")
async sendForgotPasswordOtp(@Body() body: any) {
  return this.authService.resetPassword(body);
}


@Post("refresh-token")
async refreshToken(@Body() body: { refreshToken: string }) {
  const { refreshToken } = body;
  return this.authService.refreshToken(refreshToken);
}


}