import { NextFunction, Request, Response } from "express";
import { Controller, HttpError } from "~/shared/http/types";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      error: { 
        message: err.message, 
        code: err.code 
      }
    });
  } else {
    console.error("Unexpected error:", err);
    res.status(500).json({
      error: { 
        message: "Internal server error"
      }
    });
  }
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({
    error: { 
      message: `Route not found: ${req.method} ${req.path}`, 
      code: "NOT_FOUND"
    }
  });
}

export function asyncHandler(fn: Controller) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}