import config from "config";
import { CreateRoundUseCase, EntryScoreUseCase, GetRoundUseCase, ListRoundsUseCase, SummarizeRoundUseCase } from "~/rounds/application/usecases";
import { RoundRepositoryInMemory } from "~/rounds/infra/memory/RoundRepositoryInMemory";
import { RoundRepositoryMongo } from "~/rounds/infra/mongo/RoundRepositoryMongo";
import { RoundsController } from "~/rounds/interface/http/controllers";
import { createRoundsRouter } from "~/rounds/interface/http/routes";
import { createServer, applyRoutes, applyErrorHandlers, startServer } from "~/shared/http/server";
import { connectToMongoDB } from "~/shared/db/mongodb";
import type { IRoundRepository } from "~/rounds/application/ports";

(async () => {
  // Repository selection based on environment
  let roundsRepo: IRoundRepository;

  const MONGODB_URI = config.get<string>("MONGODB_URI");
  const API_PORT = config.get<number>("API_PORT");

  if (MONGODB_URI) {
    console.log("🔌 Using MongoDB repository");
    const { db } = await connectToMongoDB(MONGODB_URI);
    roundsRepo = new RoundRepositoryMongo(db);
  } else {
    console.log("💾 Using in-memory repository");
    roundsRepo = new RoundRepositoryInMemory();
  }

  const roundsUseCases = {
    createRound: new CreateRoundUseCase(roundsRepo),
    entryScore: new EntryScoreUseCase(roundsRepo),
    summarizeRound: new SummarizeRoundUseCase(roundsRepo),
    getRound: new GetRoundUseCase(roundsRepo),
    listRounds: new ListRoundsUseCase(roundsRepo),
  };
  const roundsController = new RoundsController(roundsUseCases);
  const roundsRouter = createRoundsRouter(roundsController);
  const app = createServer();
  applyRoutes(app, [{ path: "/api/rounds", router: roundsRouter }]);
  applyErrorHandlers(app);
  startServer(app, API_PORT);
})();
