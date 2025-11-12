import { CreateRoundCommand, CreateRoundResult, EntryScoreCommand, EntryScoreResult, GetRoundQuery, GetRoundResult, ListRoundsQuery, ListRoundsResult, SummarizeRoundQuery, SummarizeRoundResult } from "~/src/rounds/application/dto";
import { IRoundRepository } from "./ports";
import { createRound, entryScore, summarizeRound } from "~/src/rounds/domain/services";
import { ulid } from "ulid";

export class CreateRoundUseCase {
  #repo: IRoundRepository;
  constructor(repo: IRoundRepository) {
    this.#repo = repo;
  }

  async execute(command: CreateRoundCommand): Promise<CreateRoundResult> {
    const round = createRound({
      id: ulid(),
      date: command.date,
      n: command.n,
      courseName: command.courseName,
    });
    await this.#repo.save(round);
    return { roundId: round.id };
  }
}

export class EntryScoreUseCase {
  #repo: IRoundRepository;
  constructor(repo: IRoundRepository) {
    this.#repo = repo;
  }

  async execute(command: EntryScoreCommand): Promise<EntryScoreResult> {
    const round = await this.#repo.findById(command.roundId);
    if (!round) throw new Error("Round not found");
    const scoredRound = entryScore({
      round,
      holeNumber: command.holeNumber,
      strokes: command.stroke,
    });
    await this.#repo.save(scoredRound);
    return { roundId: scoredRound.id };
  }
}

export class SummarizeRoundUseCase {
  #repo: IRoundRepository;
  constructor(repo: IRoundRepository) {
    this.#repo = repo;
  }

  async execute(query: SummarizeRoundQuery): Promise<SummarizeRoundResult> {
    const round = await this.#repo.findById(query.roundId);
    if (!round) throw new Error("Round not found");
    const summary = summarizeRound(round);
    return {
      roundId: round.id,
      date: round.date,
      ...summary,
    };
  }
}

export class GetRoundUseCase {
  #repo: IRoundRepository;
  constructor(repo: IRoundRepository) {
    this.#repo = repo;
  }

  async execute(query: GetRoundQuery): Promise<GetRoundResult> {
    const round = await this.#repo.findById(query.roundId);
    if (!round) throw new Error("Round not found");
    const summary = summarizeRound(round);
    return {
      roundId: round.id,
      date: round.date,
      n: round.n,
      courseName: round.courseName,
      holes: round.holes,
      scores: round.scores,
      summary,
    };
  }
}

export class ListRoundsUseCase {
  #repo: IRoundRepository;
  constructor(repo: IRoundRepository) {
    this.#repo = repo;
  }

  async execute(query: ListRoundsQuery): Promise<ListRoundsResult> {
    const rounds = await this.#repo.findAll();
    return {
      rounds: rounds.map(round => {
        const summary = summarizeRound(round);
        return {
          roundId: round.id,
          date: round.date,
          courseName: round.courseName,
          gross: summary.gross,
          toPar: summary.toPar,
        };
      }),
    };
  }
}