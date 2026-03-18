import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { EmployeeRangeEnum } from "src/comon/enums/user.enums";

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Company {
  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    minLength: 3,
    maxLength: 50,
  })
  companyName: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minLength: 3,
    maxLength: 1000,
  })
  description: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  industry: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  address: string;

  @Prop({
    type: String,
    enum: Object.values(EmployeeRangeEnum),
    required: true,
  })
  numberOfEmployees: EmployeeRangeEnum;

  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  companyEmail: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  })
  createdBy: Types.ObjectId;

  @Prop({
    type: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    default: null,
  })
  logo: {
    secure_url: string;
    public_id: string;
  } | null;

  @Prop({
    type: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    default: null,
  })
  coverPic: {
    secure_url: string;
    public_id: string;
  } | null;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: [],
  })
  HRs: Types.ObjectId[];
  @Prop({ type: Date, default: null })
  bannedAt: Date | null;

  @Prop({
    type: Boolean,
    default: false,
  })
  isDeleted: boolean;
  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({
    type: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    default: null,
  })
  legalAttachment: {
    secure_url: string;
    public_id: string;
  } | null;

  @Prop({ type: Boolean, default: false })
  approvedByAdmin: boolean;
}

export const companySchema = SchemaFactory.createForClass(Company);

export type HCompanyDocument = HydratedDocument<Company>;

companySchema.virtual("jobs", {
  ref: "Job",
  localField: "_id",
  foreignField: "companyId",
});

export const CompanyModel = MongooseModule.forFeature([
  {
    name: Company.name,
    schema: companySchema,
  },
]);
