import { HttpError } from "~/src/shared/http/types";
import { CreateRoundCommand, EntryScoreCommand } from "~/src/rounds/application/dto";

export function validateCreateRoundRequest(body: unknown): CreateRoundCommand {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "Request body must be an object", "INVALID_REQUEST");
  }

  const { date, n, courseName } = body as Record<string, unknown>;

  // date validation
  if (typeof date !== "string" || !date) {
    throw new HttpError(400, "date is required and must be a string", "INVALID_DATE");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new HttpError(400, "date must be in YYYY-MM-DD format", "INVALID_DATE_FORMAT");
  }

  // n validation
  if (n !== 9 && n !== 18) {
    throw new HttpError(400, "n must be 9 or 18", "INVALID_HOLE_COUNT");
  }

  // courseName validation (optional)
  if (courseName !== undefined && typeof courseName !== "string") {
    throw new HttpError(400, "courseName must be a string", "INVALID_COURSE_NAME");
  }

  return {
    date,
    n,
    courseName: courseName as string | undefined,
  };
}

export function validateEntryScoreRequest(
  roundId: string,
  body: unknown
): EntryScoreCommand {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "Request body must be an object", "INVALID_REQUEST");
  }

  const { holeNumber, stroke } = body as Record<string, unknown>;

  // holeNumber validation
  if (typeof holeNumber !== "number" || !Number.isInteger(holeNumber)) {
    throw new HttpError(400, "holeNumber must be an integer", "INVALID_HOLE_NUMBER");
  }

  if (holeNumber < 1 || holeNumber > 18) {
    throw new HttpError(400, "holeNumber must be between 1 and 18", "INVALID_HOLE_NUMBER");
  }

  // stroke validation
  if (typeof stroke !== "number" || !Number.isInteger(stroke)) {
    throw new HttpError(400, "stroke must be an integer", "INVALID_STROKE");
  }

  if (stroke < 1 || stroke > 12) {
    throw new HttpError(400, "stroke must be between 1 and 12", "INVALID_STROKE");
  }

  return {
    roundId,
    holeNumber,
    stroke,
  };
}
