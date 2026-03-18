import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "src/comon/enums/user.enums";
import { hash } from "src/comon/hashing/hash";
import * as crypto from "crypto";

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Prop({
    type: String,
    required: true,
    minLength: 3,
    maxLength: 25,
    trim: true,
  })
  firstName: string;

  @Prop({
    type: String,
    required: true,
    minLength: 3,
    maxLength: 25,
    trim: true,
  })
  lastName: string;

  @Virtual({
    get: function () {
      return this.firstName + " " + this.lastName;
    },
    set: function (value: string) {
      const [firstName, lastName] = value.split(" ") || [];
      return this.set({ firstName, lastName });
    },
  })
  username: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({
    type: Date,
  })
  confirmEmail: Date;
  @Prop({
    type: String,
  })
  confirmEmailOTP: string;

  @Prop({
    type: String,
    required: function () {
      return this.provider === ProviderEnum.SYSTEM;
    },
  })
  password: string;

  @Prop({
    type: String,
    enum: {
      values: Object.values(ProviderEnum),
      message: "{VALUE} is not valid provider ",
    },
    default: ProviderEnum.SYSTEM,
  })
  provider: string;

  @Prop({
    type: String,
    enum: {
      values: Object.values(GenderEnum),
      message: "{VALUE} is not valid provider ",
    },
    default: GenderEnum.FEMALE,
  })
  gender: string;

  @Prop({
    type: Date,
    required: function () {
      return this.provider === ProviderEnum.SYSTEM;
    },
    validate: {
      validator: function (value: Date) {
        if (!value || isNaN(value.getTime())) return false;

        const now = new Date();
        if (value >= now) return false;

        let age = now.getFullYear() - value.getFullYear();
        const monthDiff = now.getMonth() - value.getMonth();
        const dayDiff = now.getDate() - value.getDate();

        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;

        return age >= 18;
      },
      message: "DOB must be in the past and age must be at least 18",
    },
  })
  DOB: Date;

  @Prop({
    type: String,
  })
  mobileNumber: string;

  @Prop({
    type: String,
    enum: {
      values: Object.values(RoleEnum),
      message: "{VALUE} is not valid provider ",
    },
    default: RoleEnum.USER,
  })
  role: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isConfirmed: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ default: false })
  isBanned: boolean;

  @Prop({ type: Date, default: null })
  bannedAt: Date | null;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  })
  updatedBy: Types.ObjectId;

  @Prop({
    type: Date,
  })
  changeCredentialsTime: Date;

  @Prop({
    type: {
      secure_url: String,
      public_id: String,
    },
    default: null,
  })
  profilePic: {
    secure_url: string;
    public_id: string;
  } | null;

  @Prop({
    type: {
      secure_url: String,
      public_id: String,
    },
    default: null,
  })
  coverPic: {
    secure_url: string;
    public_id: string;
  } | null;

  otp?: any[];
}

export const userSchema = SchemaFactory.createForClass(User);

userSchema.virtual("otp", {
  localField: "_id",
  foreignField: "createdBy",
  ref: "Otp",
});

const decryptMobileNumber = (encryptedText: string): string => {
  const ENCRYPTION_KEY =
    process.env.ENCRYPTION_KEY || "default_encryption_key_32chars!";

  const [ivHex, encrypted] = encryptedText.split(":");

  if (!ivHex || !encrypted) return encryptedText;

  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "utf8"),
    iv,
  );

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

const decryptUserMobileNumber = (user: any) => {
  if (user?.mobileNumber) {
    try {
      user.mobileNumber = decryptMobileNumber(user.mobileNumber);
    } catch (error) {
      console.log("Mobile decryption failed");
    }
  }
};

userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await hash(this.password);
  }

  if (this.isModified("mobileNumber") && this.mobileNumber) {
    const ENCRYPTION_KEY =
      process.env.ENCRYPTION_KEY || "default_encryption_key_32chars!";
    const IV_LENGTH = Number(process.env.IV_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY, "utf8"),
      iv,
    );
    let encrypted = cipher.update(this.mobileNumber, "utf8", "hex");
    encrypted += cipher.final("hex");
    this.mobileNumber = iv.toString("hex") + ":" + encrypted;
  }
});
userSchema.post("findOne", function (doc) {
  if (doc) decryptUserMobileNumber(doc);
});

userSchema.post("find", function (docs) {
  if (docs?.length) docs.forEach((doc) => decryptUserMobileNumber(doc));
});

userSchema.post("findOneAndUpdate", function (doc) {
  if (doc) decryptUserMobileNumber(doc);
});

userSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await mongoose.model("Otp").deleteMany({ createdBy: doc._id });
  }
});

export type HUserDocument = HydratedDocument<User>;
export const UserModel = MongooseModule.forFeature([
  {
    name: User.name,
    schema: userSchema,
  },
]);
