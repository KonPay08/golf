import { createRound, entryScore, summarizeRound } from "~/src/rounds/domain/services";

describe("createRound", () => {
  test("9ホールのラウンドを作成できる", () => {
    const round = createRound({
      id: "test-id-1",
      date: "2025-10-16",
      n: 9,
    });

    expect(round.id).toBe("test-id-1");
    expect(round.date).toBe("2025-10-16");
    expect(round.n).toBe(9);
    expect(round.holes).toHaveLength(9);
    expect(round.scores).toHaveLength(0);
  });

  test("18ホールのラウンドを作成できる", () => {
    const round = createRound({
      id: "test-id-2",
      date: "2025-10-16",
      n: 18,
    });

    expect(round.n).toBe(18);
    expect(round.holes).toHaveLength(18);
  });

  test("nが9でも18でもない場合はエラーをスローする", () => {
    expect(() => {
      createRound({
        id: "test-id-3",
        date: "2025-10-16",
        n: 10 as any,
      });
    }).toThrow("n must be 9 or 18");
  });

  test("デフォルトのpar値は4", () => {
    const round = createRound({
      id: "test-id-4",
      date: "2025-10-16",
      n: 9,
    });

    round.holes.forEach(hole => {
      expect(hole.par).toBe(4);
    });
  });

  test("parDefaultを指定すると全ホールに適用される", () => {
    const round = createRound({
      id: "test-id-5",
      date: "2025-10-16",
      n: 9,
      parDefault: 5,
    });

    round.holes.forEach(hole => {
      expect(hole.par).toBe(5);
    });
  });

  test("parDefaultが3, 4, 5以外の場合はエラーをスローする", () => {
    expect(() => {
      createRound({
        id: "test-id-6",
        date: "2025-10-16",
        n: 9,
        parDefault: 6 as any,
      });
    }).toThrow("par must be 3, 4, 5");
  });

  test("ホール番号は1から連番で振られる", () => {
    const round = createRound({
      id: "test-id-7",
      date: "2025-10-16",
      n: 9,
    });

    const holeNumbers = round.holes.map(h => h.number);
    expect(holeNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  test("コース名を指定できる", () => {
    const round = createRound({
      id: "test-id-8",
      date: "2025-10-16",
      n: 9,
      courseName: "テストゴルフクラブ",
    });

    expect(round.courseName).toBe("テストゴルフクラブ");
  });

  test("コース名を指定しない場合はundefined", () => {
    const round = createRound({
      id: "test-id-9",
      date: "2025-10-16",
      n: 9,
    });

    expect(round.courseName).toBeUndefined();
  });
});

describe("entryScore", () => {
  test("スコアを記録できる", () => {
    const round = createRound({
      id: "test-id",
      date: "2025-10-16",
      n: 9,
    });

    const result = entryScore({
      round,
      holeNumber: 1,
      strokes: 5,
    });

    expect(result.scores).toHaveLength(1);
    expect(result.scores[0]).toEqual({ holeNumber: 1, strokes: 5 });
  });

  test("元のラウンドオブジェクトは変更されない（不変性）", () => {
    const round = createRound({
      id: "test-id",
      date: "2025-10-16",
      n: 9,
    });

    entryScore({
      round,
      holeNumber: 1,
      strokes: 5,
    });

    expect(round.scores).toHaveLength(0);
  });

  test("同じホールに再度記録すると上書きされる", () => {
    let round = createRound({
      id: "test-id",
      date: "2025-10-16",
      n: 9,
    });

    round = entryScore({ round, holeNumber: 1, strokes: 5 });
    round = entryScore({ round, holeNumber: 1, strokes: 4 });

    expect(round.scores).toHaveLength(1);
    expect(round.scores[0]).toEqual({ holeNumber: 1, strokes: 4 });
  });

  test("複数のホールにスコアを記録できる", () => {
    let round = createRound({
      id: "test-id",
      date: "2025-10-16",
      n: 9,
    });

    round = entryScore({ round, holeNumber: 1, strokes: 5 });
    round = entryScore({ round, holeNumber: 2, strokes: 4 });
    round = entryScore({ round, holeNumber: 3, strokes: 6 });

    expect(round.scores).toHaveLength(3);
    expect(round.scores).toEqual([
      { holeNumber: 1, strokes: 5 },
      { holeNumber: 2, strokes: 4 },
      { holeNumber: 3, strokes: 6 },
    ]);
  });

  test("ホール番号が範囲外の場合はエラーをスローする（下限）", () => {
    const round = createRound({
      id: "test-id",
      date: "2025-10-16",
      n: 9,
    });

    expect(() => {
      entryScore({ round, holeNumber: 0, strokes: 5 });
    }).toThrow("holeNumber must be between 1 and 9");
  });

  test("ホール番号が範囲外の場合はエラーをスローする（上限）", () => {
    const round = createRound({
      id: "test-id",
      date: "2025-10-16",
      n: 9,
    });

    expect(() => {
      entryScore({ round, holeNumber: 10, strokes: 5 });
    }).toThrow("holeNumber must be between 1 and 9");
  });

  test("18ホールラウンドでは18番ホールまで記録できる", () => {
    const round = createRound({
      id: "test-id",
      date: "2025-10-16",
      n: 18,
    });

    const result = entryScore({ round, holeNumber: 18, strokes: 5 });

    expect(result.scores).toHaveLength(1);
    expect(result.scores[0]).toEqual({ holeNumber: 18, strokes: 5 });
  });

  test("ストローク数が範囲外の場合はエラーをスローする（下限）", () => {
    const round = createRound({
      id: "test-id",
      date: "2025-10-16",
      n: 9,
    });

    expect(() => {
      entryScore({ round, holeNumber: 1, strokes: 0 });
    }).toThrow("strokes must be between 1 and 12");
  });

  test("ストローク数が範囲外の場合はエラーをスローする（上限）", () => {
    const round = createRound({
      id: "test-id",
      date: "2025-10-16",
      n: 9,
    });

    expect(() => {
      entryScore({ round, holeNumber: 1, strokes: 13 });
    }).toThrow("strokes must be between 1 and 12");
  });

  test("ストローク数の境界値（1と12）は有効", () => {
    let round = createRound({
      id: "test-id",
      date: "2025-10-16",
      n: 9,
    });

    round = entryScore({ round, holeNumber: 1, strokes: 1 });
    round = entryScore({ round, holeNumber: 2, strokes: 12 });

    expect(round.scores[0].strokes).toBe(1);
    expect(round.scores[1].strokes).toBe(12);
  });
});

describe("summarizeRound", () => {
  test("スコアがない場合は全て0を返す", () => {
    const round = createRound({
      id: "test-id",
      date: "2025-10-16",
      n: 9,
    });

    const summary = summarizeRound(round);

    expect(summary.gross).toBe(0);
    expect(summary.toPar).toBe(0);
    expect(summary.pars).toBe(0);
    expect(summary.birdies).toBe(0);
    expect(summary.eagles).toBe(0);
  });

  test("Grossを正しく計算できる", () => {
    let round = createRound({
      id: "test-id",
      date: "2025-10-16",
      n: 9,
    });

    round = entryScore({ round, holeNumber: 1, strokes: 5 });
    round = entryScore({ round, holeNumber: 2, strokes: 4 });
    round = entryScore({ round, holeNumber: 3, strokes: 3 });

    const summary = summarizeRound(round);

    expect(summary.gross).toBe(12); // 5 + 4 + 3
  });

  test("toParを正しく計算できる", () => {
    let round = createRound({
      id: "test-id",
      date: "2025-10-16",
      n: 9,
    });

    // パー4のホールに5打、4打、3打
    round = entryScore({ round, holeNumber: 1, strokes: 5 }); // +1
    round = entryScore({ round, holeNumber: 2, strokes: 4 }); // 0
    round = entryScore({ round, holeNumber: 3, strokes: 3 }); // -1

    const summary = summarizeRound(round);

    expect(summary.toPar).toBe(0); // +1 + 0 + (-1) = 0
  });

  test("パーを正しくカウントできる", () => {
    let round = createRound({
      id: "test-id",
      date: "2025-10-16",
      n: 9,
    });

    round = entryScore({ round, holeNumber: 1, strokes: 4 }); // パー
    round = entryScore({ round, holeNumber: 2, strokes: 4 }); // パー
    round = entryScore({ round, holeNumber: 3, strokes: 5 }); // ボギー

    const summary = summarizeRound(round);

    expect(summary.pars).toBe(2);
  });

  test("バーディーを正しくカウントできる", () => {
    let round = createRound({
      id: "test-id",
      date: "2025-10-16",
      n: 9,
    });

    round = entryScore({ round, holeNumber: 1, strokes: 3 }); // バーディー
    round = entryScore({ round, holeNumber: 2, strokes: 3 }); // バーディー
    round = entryScore({ round, holeNumber: 3, strokes: 4 }); // パー

    const summary = summarizeRound(round);

    expect(summary.birdies).toBe(2);
  });

  test("イーグルを正しくカウントできる", () => {
    let round = createRound({
      id: "test-id",
      date: "2025-10-16",
      n: 9,
    });

    round = entryScore({ round, holeNumber: 1, strokes: 2 }); // イーグル
    round = entryScore({ round, holeNumber: 2, strokes: 2 }); // イーグル
    round = entryScore({ round, holeNumber: 3, strokes: 3 }); // バーディー

    const summary = summarizeRound(round);

    expect(summary.eagles).toBe(2);
  });

  test("複合的な統計を正しく計算できる", () => {
    let round = createRound({
      id: "test-id",
      date: "2025-10-16",
      n: 9,
    });

    round = entryScore({ round, holeNumber: 1, strokes: 2 }); // イーグル (-2)
    round = entryScore({ round, holeNumber: 2, strokes: 3 }); // バーディー (-1)
    round = entryScore({ round, holeNumber: 3, strokes: 4 }); // パー (0)
    round = entryScore({ round, holeNumber: 4, strokes: 5 }); // ボギー (+1)
    round = entryScore({ round, holeNumber: 5, strokes: 6 }); // ダブルボギー (+2)

    const summary = summarizeRound(round);

    expect(summary.gross).toBe(20); // 2+3+4+5+6
    expect(summary.toPar).toBe(0); // -2-1+0+1+2
    expect(summary.eagles).toBe(1);
    expect(summary.birdies).toBe(1);
    expect(summary.pars).toBe(1);
  });

  test("全ホール完了時の統計", () => {
    let round = createRound({
      id: "test-id",
      date: "2025-10-16",
      n: 9,
    });

    // 全ホールパーで回る
    for (let i = 1; i <= 9; i++) {
      round = entryScore({ round, holeNumber: i, strokes: 4 });
    }

    const summary = summarizeRound(round);

    expect(summary.gross).toBe(36); // 4 × 9
    expect(summary.toPar).toBe(0);
    expect(summary.pars).toBe(9);
    expect(summary.birdies).toBe(0);
    expect(summary.eagles).toBe(0);
  });

  test("スコアが記録されていないホールは統計に影響しない", () => {
    let round = createRound({
      id: "test-id",
      date: "2025-10-16",
      n: 9,
    });

    // 1番と3番だけスコア記録（2番は記録なし）
    round = entryScore({ round, holeNumber: 1, strokes: 4 });
    round = entryScore({ round, holeNumber: 3, strokes: 4 });

    const summary = summarizeRound(round);

    expect(summary.gross).toBe(8); // 4 + 4
    expect(summary.toPar).toBe(0);
    expect(summary.pars).toBe(2);
  });

  test("異なるparのホールで正しく計算できる", () => {
    let round = createRound({
      id: "test-id",
      date: "2025-10-16",
      n: 9,
      parDefault: 5, // Par 5
    });

    round = entryScore({ round, holeNumber: 1, strokes: 4 }); // バーディー (-1)
    round = entryScore({ round, holeNumber: 2, strokes: 5 }); // パー (0)
    round = entryScore({ round, holeNumber: 3, strokes: 3 }); // イーグル (-2)

    const summary = summarizeRound(round);

    expect(summary.gross).toBe(12);
    expect(summary.toPar).toBe(-3);
    expect(summary.eagles).toBe(1);
    expect(summary.birdies).toBe(1);
    expect(summary.pars).toBe(1);
  });
});
