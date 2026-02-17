import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ResponseHelper, ResponseStruct } from "../utils/response.helper";

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ResponseStruct<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseStruct<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data is already in standard format (e.g. from ResponseHelper), return as is
        if (
          data &&
          typeof data === "object" &&
          "code" in data &&
          "msg" in data
        ) {
          return data;
        }
        // Otherwise wrap it
        return ResponseHelper.success(data);
      }),
    );
  }
}
