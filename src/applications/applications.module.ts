import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { JobModel } from 'src/DB/Models/job.model';
import { CompanyModel } from 'src/DB/Models/company.model';
import { ApplicationModel } from 'src/DB/Models/applications.model';
import { JwtService } from '@nestjs/jwt';
import { CloudinaryService } from 'src/comon/service/cloudinary.service';
import { UserModel } from 'src/DB/Models/user.model';

@Module({
  imports:[JobModel,CompanyModel,ApplicationModel , UserModel],
  controllers: [ApplicationsController],
  providers: [ApplicationsService ,JwtService,CloudinaryService],
})
export class ApplicationsModule {}
