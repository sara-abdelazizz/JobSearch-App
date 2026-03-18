import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles.decorator";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    let request;

    if (context.getType() === "http") {
      request = context.switchToHttp().getRequest();
    } else if (context.getType<string>() === "graphql") {
      const gqlContext = GqlExecutionContext.create(context);
      request = gqlContext.getContext().req;
    }

    const user = request?.user;

    if (!user) throw new ForbiddenException("User not authenticated");

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException("Access denied");
    }

    return true;
  }
}