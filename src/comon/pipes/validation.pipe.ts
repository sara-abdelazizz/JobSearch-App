import {
  BadRequestException,
  ValidationPipe,
  ValidationError,
} from "@nestjs/common";

export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors
          .map((err) => (err.constraints ? Object.values(err.constraints) : []))
          .flat()
          .join(", ");
        return new BadRequestException(messages || "Validation failed");
      },
    });
  }
}
