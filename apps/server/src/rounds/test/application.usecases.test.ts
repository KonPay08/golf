import { CreateRoundUseCase, EntryScoreUseCase, SummarizeRoundUseCase, GetRoundUseCase, ListRoundsUseCase } from "~/src/rounds/application/usecases";
import { RoundRepositoryInMemory } from "~/src/rounds/infra/memory/RoundRepositoryInMemory";
import { CreateRoundCommand, EntryScoreCommand, SummarizeRoundQuery, GetRoundQuery, ListRoundsQuery } from "~/src/rounds/application/dto";

describe("CreateRoundUseCase", () => {
  let repo: RoundRepositoryInMemory;
  let useCase: CreateRoundUseCase;

  beforeEach(() => {
    repo = new RoundRepositoryInMemory();
    useCase = new CreateRoundUseCase(repo);
  });

  describe("execute", () => {
    test("9ホールのラウンドを作成できる", async () => {
      const command: CreateRoundCommand = {
        date: "2025-10-16",
        n: 9,
      };

      const result = await useCase.execute(command);

      expect(result.roundId).toBeDefined();
      expect(typeof result.roundId).toBe("string");
      expect(result.roundId.length).toBeGreaterThan(0);
    });

    test("18ホールのラウンドを作成できる", async () => {
      const command: CreateRoundCommand = {
        date: "2025-10-16",
        n: 18,
      };

      const result = await useCase.execute(command);

      expect(result.roundId).toBeDefined();
      expect(typeof result.roundId).toBe("string");
    });

    test("コース名を指定してラウンドを作成できる", async () => {
      const command: CreateRoundCommand = {
        date: "2025-10-16",
        n: 9,
        courseName: "テストゴルフクラブ",
      };

      const result = await useCase.execute(command);

      const saved = await repo.findById(result.roundId);
      expect(saved).not.toBeNull();
      expect(saved?.courseName).toBe("テストゴルフクラブ");
    });

    test("作成したラウンドがリポジトリに保存される", async () => {
      const command: CreateRoundCommand = {
        date: "2025-10-16",
        n: 9,
      };

      const result = await useCase.execute(command);
      const saved = await repo.findById(result.roundId);

      expect(saved).not.toBeNull();
      expect(saved?.id).toBe(result.roundId);
      expect(saved?.date).toBe("2025-10-16");
      expect(saved?.n).toBe(9);
      expect(saved?.holes).toHaveLength(9);
      expect(saved?.scores).toHaveLength(0);
    });

    test("複数回実行すると異なるIDのラウンドが作成される", async () => {
      const command: CreateRoundCommand = {
        date: "2025-10-16",
        n: 9,
      };

      const result1 = await useCase.execute(command);
      const result2 = await useCase.execute(command);

      expect(result1.roundId).not.toBe(result2.roundId);

      const all = await repo.findAll();
      expect(all).toHaveLength(2);
    });

    test("入力パラメータがドメインエンティティに正しく反映される", async () => {
      const command: CreateRoundCommand = {
        date: "2025-10-17",
        n: 18,
        courseName: "サンプルCC",
      };

      const result = await useCase.execute(command);
      const saved = await repo.findById(result.roundId);

      expect(saved?.date).toBe("2025-10-17");
      expect(saved?.n).toBe(18);
      expect(saved?.holes).toHaveLength(18);
      expect(saved?.courseName).toBe("サンプルCC");
    });
  });
});

describe("EntryScoreUseCase", () => {
  let repo: RoundRepositoryInMemory;
  let createRoundUseCase: CreateRoundUseCase;
  let entryScoreUseCase: EntryScoreUseCase;

  beforeEach(() => {
    repo = new RoundRepositoryInMemory();
    createRoundUseCase = new CreateRoundUseCase(repo);
    entryScoreUseCase = new EntryScoreUseCase(repo);
  });

  describe("execute", () => {
    test("スコアを記録できる", async () => {
      // ラウンドを作成
      const createResult = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 9,
      });

      // スコアを記録
      const command: EntryScoreCommand = {
        roundId: createResult.roundId,
        holeNumber: 1,
        stroke: 5,
      };

      const result = await entryScoreUseCase.execute(command);

      expect(result.roundId).toBe(createResult.roundId);

      // リポジトリから取得して確認
      const saved = await repo.findById(createResult.roundId);
      expect(saved?.scores).toHaveLength(1);
      expect(saved?.scores[0]).toEqual({ holeNumber: 1, strokes: 5 });
    });

    test("同じホールに再度スコアを記録すると上書きされる", async () => {
      const createResult = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 9,
      });

      // 1番ホールに最初のスコア
      await entryScoreUseCase.execute({
        roundId: createResult.roundId,
        holeNumber: 1,
        stroke: 5,
      });

      // 1番ホールに2回目のスコア（上書き）
      await entryScoreUseCase.execute({
        roundId: createResult.roundId,
        holeNumber: 1,
        stroke: 4,
      });

      const saved = await repo.findById(createResult.roundId);
      expect(saved?.scores).toHaveLength(1);
      expect(saved?.scores[0]).toEqual({ holeNumber: 1, strokes: 4 });
    });

    test("複数のホールにスコアを記録できる", async () => {
      const createResult = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 9,
      });

      // 複数のホールにスコアを記録
      await entryScoreUseCase.execute({
        roundId: createResult.roundId,
        holeNumber: 1,
        stroke: 5,
      });

      await entryScoreUseCase.execute({
        roundId: createResult.roundId,
        holeNumber: 2,
        stroke: 4,
      });

      await entryScoreUseCase.execute({
        roundId: createResult.roundId,
        holeNumber: 3,
        stroke: 6,
      });

      const saved = await repo.findById(createResult.roundId);
      expect(saved?.scores).toHaveLength(3);
      expect(saved?.scores).toEqual([
        { holeNumber: 1, strokes: 5 },
        { holeNumber: 2, strokes: 4 },
        { holeNumber: 3, strokes: 6 },
      ]);
    });

    test("存在しないラウンドIDの場合はエラーをスローする", async () => {
      const command: EntryScoreCommand = {
        roundId: "non-existent-id",
        holeNumber: 1,
        stroke: 5,
      };

      await expect(entryScoreUseCase.execute(command)).rejects.toThrow("Round not found");
    });

    test("範囲外のホール番号でエラーをスローする", async () => {
      const createResult = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 9,
      });

      // 10番ホール（9ホールラウンドなので範囲外）
      const command: EntryScoreCommand = {
        roundId: createResult.roundId,
        holeNumber: 10,
        stroke: 5,
      };

      await expect(entryScoreUseCase.execute(command)).rejects.toThrow("holeNumber must be between 1 and 9");
    });

    test("範囲外のストローク数でエラーをスローする（下限）", async () => {
      const createResult = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 9,
      });

      const command: EntryScoreCommand = {
        roundId: createResult.roundId,
        holeNumber: 1,
        stroke: 0,
      };

      await expect(entryScoreUseCase.execute(command)).rejects.toThrow("strokes must be between 1 and 12");
    });

    test("範囲外のストローク数でエラーをスローする（上限）", async () => {
      const createResult = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 9,
      });

      const command: EntryScoreCommand = {
        roundId: createResult.roundId,
        holeNumber: 1,
        stroke: 13,
      };

      await expect(entryScoreUseCase.execute(command)).rejects.toThrow("strokes must be between 1 and 12");
    });

    test("18ホールラウンドでもスコアを記録できる", async () => {
      const createResult = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 18,
      });

      await entryScoreUseCase.execute({
        roundId: createResult.roundId,
        holeNumber: 18,
        stroke: 5,
      });

      const saved = await repo.findById(createResult.roundId);
      expect(saved?.scores).toHaveLength(1);
      expect(saved?.scores[0]).toEqual({ holeNumber: 18, strokes: 5 });
    });
  });
});

describe("SummarizeRoundUseCase", () => {
  let repo: RoundRepositoryInMemory;
  let createRoundUseCase: CreateRoundUseCase;
  let entryScoreUseCase: EntryScoreUseCase;
  let summarizeRoundUseCase: SummarizeRoundUseCase;

  beforeEach(() => {
    repo = new RoundRepositoryInMemory();
    createRoundUseCase = new CreateRoundUseCase(repo);
    entryScoreUseCase = new EntryScoreUseCase(repo);
    summarizeRoundUseCase = new SummarizeRoundUseCase(repo);
  });

  describe("execute", () => {
    test("スコアがない場合は全て0を返す", async () => {
      const createResult = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 9,
      });

      const query: SummarizeRoundQuery = {
        roundId: createResult.roundId,
      };

      const result = await summarizeRoundUseCase.execute(query);

      expect(result.roundId).toBe(createResult.roundId);
      expect(result.date).toBe("2025-10-16");
      expect(result.gross).toBe(0);
      expect(result.toPar).toBe(0);
      expect(result.pars).toBe(0);
      expect(result.birdies).toBe(0);
      expect(result.eagles).toBe(0);
    });

    test("1ホール分のスコアで統計を計算できる", async () => {
      const createResult = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 9,
      });

      // パー4の1番ホールに5打でスコア記録（ボギー）
      await entryScoreUseCase.execute({
        roundId: createResult.roundId,
        holeNumber: 1,
        stroke: 5,
      });

      const result = await summarizeRoundUseCase.execute({
        roundId: createResult.roundId,
      });

      expect(result.gross).toBe(5);
      expect(result.toPar).toBe(1); // 5 - 4 = +1
      expect(result.pars).toBe(0);
      expect(result.birdies).toBe(0);
      expect(result.eagles).toBe(0);
    });

    test("パーのスコアを正しくカウントできる", async () => {
      const createResult = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 9,
      });

      // パー4の1番ホールに4打（パー）
      await entryScoreUseCase.execute({
        roundId: createResult.roundId,
        holeNumber: 1,
        stroke: 4,
      });

      const result = await summarizeRoundUseCase.execute({
        roundId: createResult.roundId,
      });

      expect(result.gross).toBe(4);
      expect(result.toPar).toBe(0);
      expect(result.pars).toBe(1);
      expect(result.birdies).toBe(0);
      expect(result.eagles).toBe(0);
    });

    test("バーディーのスコアを正しくカウントできる", async () => {
      const createResult = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 9,
      });

      // パー4の1番ホールに3打（バーディー）
      await entryScoreUseCase.execute({
        roundId: createResult.roundId,
        holeNumber: 1,
        stroke: 3,
      });

      const result = await summarizeRoundUseCase.execute({
        roundId: createResult.roundId,
      });

      expect(result.gross).toBe(3);
      expect(result.toPar).toBe(-1);
      expect(result.pars).toBe(0);
      expect(result.birdies).toBe(1);
      expect(result.eagles).toBe(0);
    });

    test("イーグルのスコアを正しくカウントできる", async () => {
      const createResult = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 9,
      });

      // パー4の1番ホールに2打（イーグル）
      await entryScoreUseCase.execute({
        roundId: createResult.roundId,
        holeNumber: 1,
        stroke: 2,
      });

      const result = await summarizeRoundUseCase.execute({
        roundId: createResult.roundId,
      });

      expect(result.gross).toBe(2);
      expect(result.toPar).toBe(-2);
      expect(result.pars).toBe(0);
      expect(result.birdies).toBe(0);
      expect(result.eagles).toBe(1);
    });

    test("複数ホールの統計を正しく集計できる", async () => {
      const createResult = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 9,
      });

      // 1番: パー4に4打（パー）
      await entryScoreUseCase.execute({
        roundId: createResult.roundId,
        holeNumber: 1,
        stroke: 4,
      });

      // 2番: パー4に3打（バーディー）
      await entryScoreUseCase.execute({
        roundId: createResult.roundId,
        holeNumber: 2,
        stroke: 3,
      });

      // 3番: パー4に5打（ボギー）
      await entryScoreUseCase.execute({
        roundId: createResult.roundId,
        holeNumber: 3,
        stroke: 5,
      });

      // 4番: パー4に2打（イーグル）
      await entryScoreUseCase.execute({
        roundId: createResult.roundId,
        holeNumber: 4,
        stroke: 2,
      });

      const result = await summarizeRoundUseCase.execute({
        roundId: createResult.roundId,
      });

      expect(result.gross).toBe(14); // 4+3+5+2
      expect(result.toPar).toBe(-2); // 0-1+1-2
      expect(result.pars).toBe(1);
      expect(result.birdies).toBe(1);
      expect(result.eagles).toBe(1);
    });

    test("9ホール全てのスコアで統計を計算できる", async () => {
      const createResult = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 9,
      });

      // 全ホールにパー4で記録
      for (let i = 1; i <= 9; i++) {
        await entryScoreUseCase.execute({
          roundId: createResult.roundId,
          holeNumber: i,
          stroke: 4,
        });
      }

      const result = await summarizeRoundUseCase.execute({
        roundId: createResult.roundId,
      });

      expect(result.gross).toBe(36); // 4 × 9
      expect(result.toPar).toBe(0);
      expect(result.pars).toBe(9);
      expect(result.birdies).toBe(0);
      expect(result.eagles).toBe(0);
    });

    test("存在しないラウンドIDの場合はエラーをスローする", async () => {
      const query: SummarizeRoundQuery = {
        roundId: "non-existent-id",
      };

      await expect(summarizeRoundUseCase.execute(query)).rejects.toThrow("Round not found");
    });

    test("roundIdとdateが正しく返される", async () => {
      const createResult = await createRoundUseCase.execute({
        date: "2025-10-17",
        n: 9,
      });

      await entryScoreUseCase.execute({
        roundId: createResult.roundId,
        holeNumber: 1,
        stroke: 4,
      });

      const result = await summarizeRoundUseCase.execute({
        roundId: createResult.roundId,
      });

      expect(result.roundId).toBe(createResult.roundId);
      expect(result.date).toBe("2025-10-17");
    });
  });
});

describe("GetRoundUseCase", () => {
  let repo: RoundRepositoryInMemory;
  let createRoundUseCase: CreateRoundUseCase;
  let entryScoreUseCase: EntryScoreUseCase;
  let getRoundUseCase: GetRoundUseCase;

  beforeEach(() => {
    repo = new RoundRepositoryInMemory();
    createRoundUseCase = new CreateRoundUseCase(repo);
    entryScoreUseCase = new EntryScoreUseCase(repo);
    getRoundUseCase = new GetRoundUseCase(repo);
  });

  describe("execute", () => {
    test("ラウンドの詳細を取得できる", async () => {
      const createResult = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 9,
        courseName: "テストCC",
      });

      const query: GetRoundQuery = {
        roundId: createResult.roundId,
      };

      const result = await getRoundUseCase.execute(query);

      expect(result.roundId).toBe(createResult.roundId);
      expect(result.date).toBe("2025-10-16");
      expect(result.n).toBe(9);
      expect(result.courseName).toBe("テストCC");
      expect(result.holes).toHaveLength(9);
      expect(result.scores).toHaveLength(0);
    });

    test("ホール情報が正しく返される", async () => {
      const createResult = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 9,
      });

      const result = await getRoundUseCase.execute({
        roundId: createResult.roundId,
      });

      expect(result.holes[0]).toEqual({ number: 1, par: 4 });
      expect(result.holes[8]).toEqual({ number: 9, par: 4 });
    });

    test("スコア情報が正しく返される", async () => {
      const createResult = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 9,
      });

      await entryScoreUseCase.execute({
        roundId: createResult.roundId,
        holeNumber: 1,
        stroke: 5,
      });

      await entryScoreUseCase.execute({
        roundId: createResult.roundId,
        holeNumber: 2,
        stroke: 4,
      });

      const result = await getRoundUseCase.execute({
        roundId: createResult.roundId,
      });

      expect(result.scores).toHaveLength(2);
      expect(result.scores).toEqual([
        { holeNumber: 1, strokes: 5 },
        { holeNumber: 2, strokes: 4 },
      ]);
    });

    test("統計情報が正しく返される", async () => {
      const createResult = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 9,
      });

      // パー、バーディー、イーグルを含むスコア
      await entryScoreUseCase.execute({
        roundId: createResult.roundId,
        holeNumber: 1,
        stroke: 4, // パー
      });

      await entryScoreUseCase.execute({
        roundId: createResult.roundId,
        holeNumber: 2,
        stroke: 3, // バーディー
      });

      await entryScoreUseCase.execute({
        roundId: createResult.roundId,
        holeNumber: 3,
        stroke: 2, // イーグル
      });

      const result = await getRoundUseCase.execute({
        roundId: createResult.roundId,
      });

      expect(result.summary.gross).toBe(9);
      expect(result.summary.toPar).toBe(-3);
      expect(result.summary.pars).toBe(1);
      expect(result.summary.birdies).toBe(1);
      expect(result.summary.eagles).toBe(1);
    });

    test("存在しないラウンドIDの場合はエラーをスローする", async () => {
      const query: GetRoundQuery = {
        roundId: "non-existent-id",
      };

      await expect(getRoundUseCase.execute(query)).rejects.toThrow("Round not found");
    });

    test("スコアがない場合でも詳細を取得できる", async () => {
      const createResult = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 9,
      });

      const result = await getRoundUseCase.execute({
        roundId: createResult.roundId,
      });

      expect(result.scores).toHaveLength(0);
      expect(result.summary.gross).toBe(0);
      expect(result.summary.toPar).toBe(0);
    });
  });
});

describe("ListRoundsUseCase", () => {
  let repo: RoundRepositoryInMemory;
  let createRoundUseCase: CreateRoundUseCase;
  let entryScoreUseCase: EntryScoreUseCase;
  let listRoundsUseCase: ListRoundsUseCase;

  beforeEach(() => {
    repo = new RoundRepositoryInMemory();
    createRoundUseCase = new CreateRoundUseCase(repo);
    entryScoreUseCase = new EntryScoreUseCase(repo);
    listRoundsUseCase = new ListRoundsUseCase(repo);
  });

  describe("execute", () => {
    test("空の場合は空配列を返す", async () => {
      const query: ListRoundsQuery = {};
      const result = await listRoundsUseCase.execute(query);

      expect(result.rounds).toEqual([]);
    });

    test("1件のラウンドを取得できる", async () => {
      const createResult = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 9,
        courseName: "テストCC",
      });

      await entryScoreUseCase.execute({
        roundId: createResult.roundId,
        holeNumber: 1,
        stroke: 4,
      });

      const result = await listRoundsUseCase.execute({});

      expect(result.rounds).toHaveLength(1);
      expect(result.rounds[0].roundId).toBe(createResult.roundId);
      expect(result.rounds[0].date).toBe("2025-10-16");
      expect(result.rounds[0].courseName).toBe("テストCC");
      expect(result.rounds[0].gross).toBe(4);
      expect(result.rounds[0].toPar).toBe(0);
    });

    test("複数のラウンドを取得できる", async () => {
      const round1 = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 9,
        courseName: "テストCC",
      });

      const round2 = await createRoundUseCase.execute({
        date: "2025-10-15",
        n: 18,
        courseName: "サンプルCC",
      });

      // round1にスコア記録
      await entryScoreUseCase.execute({
        roundId: round1.roundId,
        holeNumber: 1,
        stroke: 4,
      });

      // round2にスコア記録
      await entryScoreUseCase.execute({
        roundId: round2.roundId,
        holeNumber: 1,
        stroke: 5,
      });

      const result = await listRoundsUseCase.execute({});

      expect(result.rounds).toHaveLength(2);
      expect(result.rounds.map(r => r.roundId)).toContain(round1.roundId);
      expect(result.rounds.map(r => r.roundId)).toContain(round2.roundId);
    });

    test("各ラウンドの統計が正しく計算される", async () => {
      const round1 = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 9,
      });

      // round1: 全ホールパー
      for (let i = 1; i <= 9; i++) {
        await entryScoreUseCase.execute({
          roundId: round1.roundId,
          holeNumber: i,
          stroke: 4,
        });
      }

      const round2 = await createRoundUseCase.execute({
        date: "2025-10-15",
        n: 9,
      });

      // round2: 全ホール+1
      for (let i = 1; i <= 9; i++) {
        await entryScoreUseCase.execute({
          roundId: round2.roundId,
          holeNumber: i,
          stroke: 5,
        });
      }

      const output = await listRoundsUseCase.execute({});

      const round1Data = output.rounds.find(r => r.roundId === round1.roundId);
      const round2Data = output.rounds.find(r => r.roundId === round2.roundId);

      expect(round1Data?.gross).toBe(36);
      expect(round1Data?.toPar).toBe(0);

      expect(round2Data?.gross).toBe(45);
      expect(round2Data?.toPar).toBe(9);
    });

    test("スコアがないラウンドも一覧に含まれる", async () => {
      const round1 = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 9,
      });

      const result = await listRoundsUseCase.execute({});

      expect(result.rounds).toHaveLength(1);
      expect(result.rounds[0].gross).toBe(0);
      expect(result.rounds[0].toPar).toBe(0);
    });

    test("コース名が設定されていないラウンドも取得できる", async () => {
      const round1 = await createRoundUseCase.execute({
        date: "2025-10-16",
        n: 9,
        // courseName なし
      });

      const result = await listRoundsUseCase.execute({});

      expect(result.rounds[0].courseName).toBeUndefined();
    });
  });
});
