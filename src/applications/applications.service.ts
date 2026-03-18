import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { emitToUsers } from "src/comon/Sockets/socket.manager";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { CloudinaryService } from "src/comon/service/cloudinary.service";
import { Application } from "src/DB/Models/applications.model";
import { Job } from "src/DB/Models/job.model";
import { Company } from "src/DB/Models/company.model";
import { User } from "src/DB/Models/user.model";
import { ApplicationStatusEnum } from "src/comon/enums/user.enums";
import { emailEvents } from "src/comon/utils/events/email.events";

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name)
    private readonly applicationModel: Model<Application>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Job.name)
    private readonly jobModel: Model<Job>,
    @InjectModel(Company.name) private readonly companyModel: Model<Company>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  async applyToJob(
    jobId: string,
    userId: Types.ObjectId,
    file: Express.Multer.File,
  ) {
    if (!Types.ObjectId.isValid(jobId)) {
      throw new BadRequestException("Invalid job id");
    }

    const job = await this.jobModel.findById(jobId);
    if (!job) {
      throw new NotFoundException("Job not found");
    }

    if (job.closed) {
      throw new BadRequestException("Job is closed");
    }

    if (!file) {
      throw new BadRequestException("CV is required");
    }

    if (file.mimetype !== "application/pdf") {
      throw new BadRequestException("Only PDF allowed");
    }

    const existing = await this.applicationModel.findOne({
      jobId,
      userId,
    });

    if (existing) {
      throw new BadRequestException("Already applied");
    }

    const uploaded: any = await this.cloudinaryService.uploadToCloudinary(
      file.buffer,
      "job-search-app/cvs",
    );

    const application = await this.applicationModel.create({
      jobId: job._id,
      userId,
      userCV: {
        secure_url: uploaded.secure_url,
        public_id: uploaded.public_id,
      },
    });

    const company = await this.companyModel.findById(job.companyId);

    if (company) {
      const receivers = [
        company.createdBy.toString(),
        ...company.HRs.map((hr) => hr.toString()),
      ];

      emitToUsers(receivers, "newApplication", {
        message: "New application submitted",
        jobId: job._id,
        applicationId: application._id,
        applicantId: userId,
      });
    }

    return {
      message: "Applied successfully",
      application,
    };
  }
  async updateApplicationStatus(
    applicationId: string,
    currentUserId: Types.ObjectId,
    status: ApplicationStatusEnum,
  ) {
    if (!Types.ObjectId.isValid(applicationId)) {
      throw new BadRequestException("Invalid application id");
    }

    if (
      status !== ApplicationStatusEnum.ACCEPTED &&
      status !== ApplicationStatusEnum.REJECTED
    ) {
      throw new BadRequestException(
        "Status must be accepted or rejected only",
      );
    }

    const application = await this.applicationModel.findById(applicationId);
    if (!application) {
      throw new NotFoundException("Application not found");
    }

    const job = await this.jobModel.findById(application.jobId);
    if (!job) {
      throw new NotFoundException("Job not found");
    }

    const company = await this.companyModel.findById(job.companyId);
    if (!company) {
      throw new NotFoundException("Company not found");
    }

    const currentUserIdStr = currentUserId.toString();

    const isOwner = company.createdBy.toString() === currentUserIdStr;
    const isHR = company.HRs?.some(
      (hr) => hr.toString() === currentUserIdStr,
    );

    if (!isOwner && !isHR) {
      throw new ForbiddenException(
        "Only company owner or HR can accept or reject applicants",
      );
    }

    const applicant = await this.userModel.findById(application.userId);
    if (!applicant) {
      throw new NotFoundException("Applicant not found");
    }

    if (application.status !== ApplicationStatusEnum.PENDING) {
      throw new BadRequestException(
        "Application already has a final decision",
      );
    }

    application.status = status;
    await application.save();

    if (status === ApplicationStatusEnum.ACCEPTED) {
      emailEvents.emit("applicationStatus", {
        to: applicant.email,
        subject: "Job Application Accepted",
        html: `
          <h2>Hello ${applicant.firstName}</h2>
          <p>We are happy to inform you that your application for <b>${job.jobTitle}</b> has been accepted.</p>
          <p>Company: ${company.companyName}</p>
        `,
      });
    }

    if (status === ApplicationStatusEnum.REJECTED) {
      emailEvents.emit("applicationStatus", {
        to: applicant.email,
        subject: "Job Application Rejected",
        html: `
          <h2>Hello ${applicant.firstName}</h2>
          <p>Thank you for applying for <b>${job.jobTitle}</b>.</p>
          <p>Unfortunately, your application has been rejected.</p>
          <p>Company: ${company.companyName}</p>
        `,
      });
    }

    return {
      message: `Application ${status} successfully`,
      application,
    };
  }
}
