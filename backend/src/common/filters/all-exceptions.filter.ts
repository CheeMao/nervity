import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { ResponseHelper } from "../utils/response.helper";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 打印详细错误日志
    console.error("=== Exception ===");
    console.error(exception);

    let message =
      exception instanceof HttpException
        ? exception.message || exception.getResponse()["message"]
        : "Server Error";

    if (message === 'Forbidden resource') {
      message = '权限不足，无法访问该资源';
    }

    // Map standard HTTP status to business codes if needed, or default to 50000/error code
    let code = 50000;
    if (status === HttpStatus.UNAUTHORIZED)
      code = 50008; // Token Invalid
    else if (status === HttpStatus.FORBIDDEN)
      code = 50003; // No Permission
    else if (status === HttpStatus.BAD_REQUEST) code = 40000; // Bad Request

    const errorResponse = ResponseHelper.error(message, code, status);

    response.status(status).json(errorResponse);
  }
}
