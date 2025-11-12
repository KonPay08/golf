import { Router } from "express";
import { RoundsController } from "./controllers";
import { asyncHandler } from "~/shared/http/middleware";

export function createRoundsRouter(controller: RoundsController): Router {
  const router = Router();

  router.get("/", asyncHandler(controller.listRounds));
  router.post("/", asyncHandler(controller.createRound));
  router.get("/:id", asyncHandler(controller.getRound));
  router.get("/:id/summary", asyncHandler(controller.summarizeRound));
  router.post("/:id/scores", asyncHandler(controller.entryScore));

  return router;
}
