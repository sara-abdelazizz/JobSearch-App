import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { AuthGuard } from "src/comon/guards/auth.guards";
import { GetJobsDto } from "./dto/getJobs.dto";
import { GetCompanyJobsDto } from "./dto/getCompanyJobs.dto";
import { GetJobApplicationsDto } from "src/applications/dto/get-application.dto";

@Controller("jobs")
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(AuthGuard)
  addJob(@Body() createJobDto: CreateJobDto, @Req() req: any) {
    return this.jobsService.addJob(createJobDto, req.user._id);
  }

  @Patch(":jobId")
  @UseGuards(AuthGuard)
  updateJob(
    @Param("jobId") jobId: string,
    @Body() updateJobDto: UpdateJobDto,
    @Req() req: any,
  ) {
    const userId = req.user._id;

    return this.jobsService.updateJob(jobId, updateJobDto, userId);
  }

  @Delete(":jobId")
  @UseGuards(AuthGuard)
  deleteJob(@Param("jobId") jobId: string, @Req() req: any) {
    const userId = req.user._id;
    return this.jobsService.deleteJob(jobId, userId);
  }

@Get()
getJobs(
  @Param("companyId") companyId: string,
  @Query() query: GetCompanyJobsDto,
) {
  return this.jobsService.getJobs({
    ...query,
    companyId,
  });
}

   @Get("filter")
  getFilteredJobs(@Query() query: GetJobsDto) {
    return this.jobsService.getFilteredJobs(query);
  }

  
  @Get(":jobId/applications")
  @UseGuards(AuthGuard)
  async getApplicationsForJob(
    @Param("jobId") jobId: string,
    @Query() query: GetJobApplicationsDto,
    @Req() req: any,
  ) {
    return this.jobsService.getApplicationsForJob(
      jobId,
      req.user._id,
      query,
    );
  }
}
