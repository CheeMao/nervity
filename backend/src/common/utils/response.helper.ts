import { Injectable } from "@nestjs/common";

export interface ResponseStruct<T> {
  code: number;
  data: T;
  msg: string;
  status?: number; // Optional standard HTTP status
}

@Injectable()
export class ResponseHelper {
  static success<T>(data: T, msg: string = "操作成功"): ResponseStruct<T> {
    return {
      code: 20000,
      data,
      msg,
      status: 200,
    };
  }

  static error(
    msg: string = "操作失败",
    code: number = 50000,
    status: number = 500,
  ): ResponseStruct<null> {
    return {
      code,
      data: null,
      msg,
      status,
    };
  }
}
