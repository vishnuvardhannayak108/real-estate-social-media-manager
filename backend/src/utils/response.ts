import type { Response } from "express";

import type { ApiErrorBody, ApiSuccessBody } from "../types/index.js";

export function ok<T>(res: Response, data: T, status = 200) {
  const body: ApiSuccessBody<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
  return res.status(status).json(body);
}

export function fail(
  res: Response,
  code: ApiErrorBody["error"]["code"],
  message: string,
  status: number
) {
  const body: ApiErrorBody = {
    success: false,
    error: { code, message },
    timestamp: new Date().toISOString(),
  };
  return res.status(status).json(body);
}
