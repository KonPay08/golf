import { CreateRoundUseCase, EntryScoreUseCase, GetRoundUseCase, ListRoundsUseCase, SummarizeRoundUseCase } from "~/src/rounds/application/usecases";
import { CreateRoundResult, EntryScoreResult, SummarizeRoundResult, GetRoundResult, ListRoundsResult } from "~/src/rounds/application/dto";
import { validateCreateRoundRequest, validateEntryScoreRequest } from "~/src/rounds/interface/http/validators";
import { Controller, HttpError, SuccessResponse } from "~/src/shared/http/types";

export type UseCases = {
  createRound: CreateRoundUseCase;
  entryScore: EntryScoreUseCase;
  summarizeRound: SummarizeRoundUseCase;
  getRound: GetRoundUseCase;
  listRounds: ListRoundsUseCase;
};

export class RoundsController {
  constructor(private useCases: UseCases) {}

  createRound: Controller = async (req, res) => {
    const command = validateCreateRoundRequest(req.body);
    const result = await this.useCases.createRound.execute(command);
    const response: SuccessResponse<CreateRoundResult> = {
      data: result,
    };
    res.status(201).json(response);
  };

  entryScore: Controller = async (req, res) => {
    const roundId = req.params.id;
    if (!roundId) {
      throw new HttpError(400, "Round ID is required", "MISSING_ROUND_ID");
    }

    const command = validateEntryScoreRequest(roundId, req.body);
    const result = await this.useCases.entryScore.execute(command);
    const response: SuccessResponse<EntryScoreResult> = {
      data: result,
    };
    res.status(200).json(response);
  };

  summarizeRound: Controller = async (req, res) => {
    const roundId = req.params.id;
    if (!roundId) {
      throw new HttpError(400, "Round ID is required", "MISSING_ROUND_ID");
    }

    const result = await this.useCases.summarizeRound.execute({ roundId });
    const response: SuccessResponse<SummarizeRoundResult> = {
      data: result,
    };
    res.status(200).json(response);
  };

  getRound: Controller = async (req, res) => {
    const roundId = req.params.id;
    if (!roundId) {
      throw new HttpError(400, "Round ID is required", "MISSING_ROUND_ID");
    }

    const result = await this.useCases.getRound.execute({ roundId });
    const response: SuccessResponse<GetRoundResult> = {
      data: result,
    };
    res.status(200).json(response);
  };

  listRounds: Controller = async (req, res) => {
    const result = await this.useCases.listRounds.execute({});
    const response: SuccessResponse<ListRoundsResult> = {
      data: result,
    };
    res.status(200).json(response);
  };
}
