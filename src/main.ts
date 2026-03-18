import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { LoggerInterceptor } from "./comon/interceptors/logger.interceptors";
import { CustomValidationPipe } from "./comon/pipes/validation.pipe";
import { initializeSocket } from "./comon/Sockets/sockets.server";
import "src/comon/utils/events/email.events";


async function bootstrap() {
  const port = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule);

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: {
      status: 429,
      message: "Too many requests, please try again later.",
    },
  });

  app.use(helmet());
  app.enableCors();
  app.use(limiter);
  app.useGlobalInterceptors(new LoggerInterceptor());
  app.useGlobalPipes(new CustomValidationPipe());

  const httpServer = app.getHttpServer();
  initializeSocket(httpServer);
  await app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}
bootstrap();
