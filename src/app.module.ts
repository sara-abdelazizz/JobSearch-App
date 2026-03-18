import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { resolve, join } from "path";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from "./user/user.module";
import { ChatModule } from "./chat/chat.module";
import { JobsModule } from "./jobs/jobs.module";
import { CompanyModule } from "./company/company.module";
import { AuthModule } from "./auth/auth.module";
import { ScheduleModule } from "@nestjs/schedule";
import { AdminModule } from "./admin/admin.module";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { ApplicationsModule } from './applications/applications.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      sortSchema: true,
      context: ({ req }) => ({ req }),
    }),
    ConfigModule.forRoot({
      envFilePath: resolve(process.cwd(), "config/.env.dev"),
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI as string, {
      serverSelectionTimeoutMS: 5000,
      onConnectionCreate(connection) {
        connection.on("connected", () => {
          console.log("MongoDB Connected Successfully");
        });
      },
    }),
    UserModule,
    AuthModule,
    CompanyModule,
    JobsModule,
    ChatModule,
    AdminModule,
    ApplicationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
