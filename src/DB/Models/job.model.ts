import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { JobLocationEnum, WorkingTimeEnum, SeniorityLevelEnum } from "src/comon/enums/user.enums";
import { Application } from "./applications.model";



@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Job {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  jobTitle: string;

  @Prop({
    type: String,
    enum: Object.values(JobLocationEnum),
    required: true,
  })
  jobLocation: JobLocationEnum;

  @Prop({
    type: String,
    enum: Object.values(WorkingTimeEnum),
    required: true,
  })
  workingTime: WorkingTimeEnum;

  @Prop({
    type: String,
    enum: Object.values(SeniorityLevelEnum),
    required: true,
  })
  seniorityLevel: SeniorityLevelEnum;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  jobDescription: string;

  @Prop({
    type: [String],
    required: true,
    default: [],
  })
  technicalSkills: string[];

  @Prop({
    type: [String],
    required: true,
    default: [],
  })
  softSkills: string[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  })
  addedBy: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  })
  updatedBy: Types.ObjectId | null;

  @Prop({
    type: Boolean,
    default: false,
  })
  closed: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  })
  companyId: Types.ObjectId;

  applications?: Application[];
}

export const JobSchema = SchemaFactory.createForClass(Job);

export type JobDocument = HydratedDocument<Job>;

JobSchema.virtual("applications", {
  ref: "Application",       
  localField: "_id",        
  foreignField: "jobId",    
});

export const JobModel = MongooseModule.forFeature([
  {
    name: Job.name,
    schema: JobSchema,
  },
]);