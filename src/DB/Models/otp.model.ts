import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { User } from "./user.model";
import { OtpEnum } from "src/comon/enums/user.enums";
import { hash } from "src/comon/hashing/hash";
import { emailEvents } from "src/comon/utils/events/email.events";

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Otp {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  code: string;
  @Prop({
    type: Date,
    required: true,
  })
  expiredAt: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  })
  createdBy: Types.ObjectId;

  @Prop({
    type: String,
    enum: OtpEnum,
    required: true,
  })
  type: string;
}

export const otpSchema = SchemaFactory.createForClass(Otp);
export type HOtpDocument = HydratedDocument<Otp>;
otpSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.pre(
  "save",
  async function (this: HOtpDocument & { wasNew: boolean; plainOtp?: string }) {
    if (this.isModified("code")) {
      this.wasNew = this.isNew;
      this.plainOtp = this.code;
      this.code = await hash(this.code);
      await this.populate("createdBy");
    }
  },
);
otpSchema.post("save", async function (doc, next) {
  const that = this as HOtpDocument & { wasNew?: boolean; plainOtp?: string };
  if (that.wasNew && that.plainOtp) {
    emailEvents.emit("confirmEmail", {
      to: (that.createdBy as any).email,
      otp: that.plainOtp,
      firstName: (that.createdBy as any).firstName,
    });
  }
});

export const OtpModel = MongooseModule.forFeature([
  {
    name: Otp.name,
    schema: otpSchema,
  },
]);
