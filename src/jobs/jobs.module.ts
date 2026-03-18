import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JobModel } from 'src/DB/Models/job.model';
import { CompanyModel } from 'src/DB/Models/company.model';
import { UserModel } from 'src/DB/Models/user.model';
import { JwtService } from '@nestjs/jwt';
import { ApplicationModel } from 'src/DB/Models/applications.model';

@Module({
  imports:[JobModel , CompanyModel , UserModel , ApplicationModel],
  controllers: [JobsController],
  providers: [JobsService , JwtService],
})
export class JobsModule {}
