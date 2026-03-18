import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Otp, HOtpDocument } from "src/DB/Models/otp.model";

@Injectable()
export class OtpCronService {
  constructor(
    @InjectModel(Otp.name) private otpModel: Model<HOtpDocument>,
  ) {}

  @Cron("0 */6 * * *")
  async deleteExpiredOtps() {
    await this.otpModel.deleteMany({
      expiredAt: { $lt: new Date() },
    });

    console.log("Expired OTPs deleted");
  }
}