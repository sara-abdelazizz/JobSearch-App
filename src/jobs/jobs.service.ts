import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Job } from "src/DB/Models/job.model";
import { Company } from "src/DB/Models/company.model";
import { GetJobsDto } from "./dto/getJobs.dto";
import { GetCompanyJobsDto } from "./dto/getCompanyJobs.dto";
import { GetJobApplicationsDto } from "src/applications/dto/get-application.dto";
import { Application } from "src/DB/Models/applications.model";

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<Job>,
    @InjectModel(Company.name) private companyModel: Model<Company>,
    @InjectModel(Application.name) private applicationModel: Model<Application>,
  ) {}
  async addJob(createJobDto: CreateJobDto, userId: Types.ObjectId) {
    const company = await this.companyModel.findById(createJobDto.companyId);

    if (!company) {
      throw new NotFoundException("Company not found");
    }

    if (company.isDeleted) {
      throw new BadRequestException("Company is deleted");
    }

    if (company.bannedAt) {
      throw new BadRequestException("Company is banned");
    }

    const isOwner = company.createdBy.toString() === userId.toString();

    const isHR = company.HRs?.some((hr) => hr.toString() === userId.toString());

    if (!isOwner && !isHR) {
      throw new UnauthorizedException("Only company owner or HR can add jobs");
    }

    const job = await this.jobModel.create({
      ...createJobDto,
      companyId: company._id,
      addedBy: userId,
    });

    return {
      message: "Job created successfully",
      job,
    };
  }
  async updateJob(
    jobId: string,
    updateJobDto: UpdateJobDto,
    userId: Types.ObjectId,
  ) {
    const job = await this.jobModel.findById(jobId);

    if (!job) {
      throw new NotFoundException("Job not found");
    }

    if (job.addedBy.toString() !== userId.toString()) {
      throw new UnauthorizedException("Only the job owner can update this job");
    }

    if (updateJobDto.jobTitle !== undefined) {
      job.jobTitle = updateJobDto.jobTitle;
    }

    if (updateJobDto.jobLocation !== undefined) {
      job.jobLocation = updateJobDto.jobLocation;
    }

    if (updateJobDto.workingTime !== undefined) {
      job.workingTime = updateJobDto.workingTime;
    }

    if (updateJobDto.seniorityLevel !== undefined) {
      job.seniorityLevel = updateJobDto.seniorityLevel;
    }

    if (updateJobDto.jobDescription !== undefined) {
      job.jobDescription = updateJobDto.jobDescription;
    }

    if (updateJobDto.technicalSkills !== undefined) {
      job.technicalSkills = updateJobDto.technicalSkills;
    }

    if (updateJobDto.softSkills !== undefined) {
      job.softSkills = updateJobDto.softSkills;
    }

    job.updatedBy = userId;

    await job.save();

    return {
      message: "Job updated successfully",
      job,
    };
  }
  async deleteJob(jobId: string, userId: Types.ObjectId) {
    const job = await this.jobModel.findById(jobId);

    if (!job) {
      throw new NotFoundException("Job not found");
    }

    if (job.closed) {
      throw new BadRequestException("Job already deleted");
    }

    const company = await this.companyModel.findById(job.companyId);

    if (!company) {
      throw new NotFoundException("Company not found");
    }

    if (company.isDeleted) {
      throw new BadRequestException("Company is deleted");
    }

    const isHR = company.HRs?.some((hr) => hr.toString() === userId.toString());

    if (!isHR) {
      throw new UnauthorizedException(
        "Only company HR related to this job company can delete this job",
      );
    }

    job.closed = true;
    job.updatedBy = userId;

    await job.save();

    return {
      message: "Job deleted successfully",
      job,
    };
  }
async getJobs(query: GetCompanyJobsDto) {
  const {
    companyId,
    page = 1,
    limit = 10,
    sort = "createdAt",
    search,
  } = query;

  const skip = (page - 1) * limit;

  const filter: any = {
    closed: false,
  };

  if (companyId) {
    filter.companyId = companyId;
  }

  if (search) {
    const companies = await this.companyModel.find({
      companyName: { $regex: search, $options: "i" },
    });

    const companyIds = companies.map((company) => company._id);

    filter.companyId = { $in: companyIds };
  }

  const jobs = await this.jobModel
    .find(filter)
    .sort({ [sort]: -1 })
    .skip(skip)
    .limit(limit)
    .populate("companyId", "companyName");

  const total = await this.jobModel.countDocuments(filter);

  return {
    message: "Jobs fetched successfully",
    total,
    page,
    limit,
    jobs,
  };
}
  async getFilteredJobs(query: GetJobsDto) {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      workingTime,
      jobLocation,
      seniorityLevel,
      jobTitle,
      technicalSkills,
    } = query;

    const skip = (page - 1) * limit;

    let filter: any = {
      closed: false,
    };

    if (workingTime) {
      filter.workingTime = workingTime;
    }

    if (jobLocation) {
      filter.jobLocation = jobLocation;
    }

    if (seniorityLevel) {
      filter.seniorityLevel = seniorityLevel;
    }

    if (jobTitle) {
      filter.jobTitle = { $regex: jobTitle, $options: "i" };
    }

    if (technicalSkills) {
      filter.technicalSkills = { $in: [technicalSkills] };
    }

    const jobs = await this.jobModel
      .find(filter)
      .sort({ [sort]: -1 })
      .skip(skip)
      .limit(limit)
      .populate("companyId", "companyName");

    const total = await this.jobModel.countDocuments(filter);

    return {
      message: "Filtered jobs fetched successfully",
      total,
      page,
      limit,
      jobs,
    };
  }
 async getApplicationsForJob(
  jobId: string,
  currentUserId: Types.ObjectId,
  query: GetJobApplicationsDto,
) {
  if (!Types.ObjectId.isValid(jobId)) {
    throw new BadRequestException("Invalid job id");
  }

  const skip = Number(query.skip) || 0;
  const limit = Number(query.limit) || 10;
  const sortValue = query.sort === "createdAt" ? 1 : -1;

  const job = await this.jobModel.findById(jobId);
  if (!job) {
    throw new NotFoundException("Job not found");
  }

  const company = await this.companyModel.findById(job.companyId);
  if (!company) {
    throw new NotFoundException("Company not found");
  }

  const currentUserIdStr = currentUserId.toString();

  const isOwner = company.createdBy?.toString() === currentUserIdStr;
  const isHR = company.HRs?.some(
    (hr: Types.ObjectId) => hr.toString() === currentUserIdStr,
  );

  if (!isOwner && !isHR) {
    throw new ForbiddenException(
      "Only company owner or company HR can view applications",
    );
  }

  const totalCount = await this.applicationModel.countDocuments({
    jobId: job._id,
  });

  const populatedJob = await this.jobModel.findById(jobId).populate({
    path: "applications",
    options: {
      skip,
      limit,
      sort: { createdAt: sortValue },
    },
    populate: {
      path: "userId",
      select: "firstName lastName userName email mobileNumber profilePic coverPic",
    },
  });

  return {
    message: "Applications fetched successfully",
    pagination: {
      totalCount,
      skip,
      limit,
      sort: query.sort || "-createdAt",
    },
    applications: populatedJob?.applications || [],
  };
}
}
