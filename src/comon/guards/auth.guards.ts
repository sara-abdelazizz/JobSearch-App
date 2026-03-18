import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { HUserDocument, User } from "src/DB/Models/user.model";
import { JwtService } from "@nestjs/jwt";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private userModel: Model<HUserDocument>,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext) {
    let request;

    if (context.getType() === "http") {
      request = context.switchToHttp().getRequest();
    } else if (context.getType<string>() === "graphql") {
      const gqlContext = GqlExecutionContext.create(context);
      request = gqlContext.getContext().req;
    }

    const token = request?.headers?.authorization?.split(" ")[1];

    if (!token) throw new UnauthorizedException("Token is required");

    const payload = await this.jwtService.verify(token, {
      secret: process.env.TOKEN_ACCESS_ADMIN_SECRET,
    });

    const user = await this.userModel.findById(payload.id);
    if (!user) throw new BadRequestException("User not found");

    request.user = user;

    return true;
  }
}