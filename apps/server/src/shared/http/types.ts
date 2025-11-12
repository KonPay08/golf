import { NextFunction, Request, Response } from "express";
export type { ErrorResponse, SuccessResponse } from "@golf/shared";

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export type Controller = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;