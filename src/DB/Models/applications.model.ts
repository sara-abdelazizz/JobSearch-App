import { MongooseModule, Prop ,Schema, SchemaFactory} from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { ApplicationStatusEnum } from "src/comon/enums/user.enums";
;

@Schema({ timestamps: true })
export class Application {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  })
  jobId: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: {
      secure_url: String,
      public_id: String,
    },
    required: true,
  })
  userCV: {
    secure_url: string;
    public_id: string;
  };

  @Prop({
    type: String,
    enum:Object.values(ApplicationStatusEnum),
    default: ApplicationStatusEnum.PENDING,
  })
  status: ApplicationStatusEnum;
}
export const applicationSchema = SchemaFactory.createForClass(Application);

export type ApplicationDocument = HydratedDocument<Application>;

export const ApplicationModel = MongooseModule.forFeature([
  {
    name: Application.name,
    schema: applicationSchema,
  },
]);