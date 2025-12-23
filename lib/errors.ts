type HttpStatus =
  | 400
  | 401
  | 403
  | 404
  | 409
  | 422
  | 429
  | 500;

type AppErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "INTERNAL";

export class AppError extends Error {
  readonly status: HttpStatus;
  readonly code: AppErrorCode;
  readonly details?: unknown;

  constructor(params: {
    message: string;
    status: HttpStatus;
    code: AppErrorCode;
    cause?: unknown;
    details?: unknown;
  }) {
    super(params.message);
    this.name = "AppError";
    this.status = params.status;
    this.code = params.code;
    this.details = params.details;
    if (params.cause) {
      this.cause = params.cause;
    }
  }
}

export const errors = {
  badRequest(message: string, details?: unknown) {
    return new AppError({ message, status: 400, code: "BAD_REQUEST", details });
  },
  unauthorized(message = "Unauthorized") {
    return new AppError({ message, status: 401, code: "UNAUTHORIZED" });
  },
  forbidden(message = "Forbidden") {
    return new AppError({ message, status: 403, code: "FORBIDDEN" });
  },
  notFound(message = "Not Found") {
    return new AppError({ message, status: 404, code: "NOT_FOUND" });
  },
  conflict(message: string, details?: unknown) {
    return new AppError({ message, status: 409, code: "CONFLICT", details });
  },
  validation(message: string, details?: unknown) {
    return new AppError({
      message,
      status: 422,
      code: "VALIDATION_ERROR",
      details,
    });
  },
  rateLimited(message = "Too many requests") {
    return new AppError({ message, status: 429, code: "RATE_LIMITED" });
  },
  internal(message = "Internal server error", cause?: unknown) {
    return new AppError({ message, status: 500, code: "INTERNAL", cause });
  },
};

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toResponseError(error: unknown) {
  if (isAppError(error)) {
    return {
      status: error.status,
      body: { error: { code: error.code, message: error.message, details: error.details } },
    };
  }

  return {
    status: 500,
    body: { error: { code: "INTERNAL", message: "Internal server error" } },
  };
}
