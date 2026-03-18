import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const now = Date.now();
    const type = context.getType<"http" | "graphql" | "ws" | "rpc">();

    if (type === "http") {
      const request = context.switchToHttp().getRequest();
      const { method, url } = request;

      console.log(`[${method}] [${url} Request started......]`);

      return next.handle().pipe(
        tap(() => {
          const time = Date.now() - now;
          console.log(`[${method}] [${url} Complete In ${time}ms]`);
        }),
      );
    }

    if (type === "graphql") {
      const handlerName = context.getHandler().name;

      console.log(`[GraphQL] [${handlerName} Request started......]`);

      return next.handle().pipe(
        tap(() => {
          const time = Date.now() - now;
          console.log(`[GraphQL] [${handlerName} Complete In ${time}ms]`);
        }),
      );
    }

    return next.handle();
  }
}