import { RoundRepositoryInMemory } from "~/rounds/infra/memory/RoundRepositoryInMemory";
import { createRound } from "~/rounds/domain/services";

describe("RoundRepositoryInMemory", () => {
  let repo: RoundRepositoryInMemory;

  beforeEach(() => {
    repo = new RoundRepositoryInMemory();
  });

  describe("save", () => {
    test("ラウンドを保存できる", async () => {
      const round = createRound({
        id: "round-1",
        date: "2025-10-16",
        n: 9,
      });

      await repo.save(round);
      const found = await repo.findById("round-1");

      expect(found).not.toBeNull();
      expect(found?.id).toBe("round-1");
      expect(found?.date).toBe("2025-10-16");
      expect(found?.n).toBe(9);
    });

    test("同じIDで保存すると上書きされる", async () => {
      const round1 = createRound({
        id: "round-1",
        date: "2025-10-16",
        n: 9,
      });
      const round2 = createRound({
        id: "round-1",
        date: "2025-10-17",
        n: 18,
      });

      await repo.save(round1);
      await repo.save(round2);

      const found = await repo.findById("round-1");
      expect(found?.date).toBe("2025-10-17");
      expect(found?.n).toBe(18);
    });

    test("保存後に元のオブジェクトを変更してもリポジトリ内のデータは変わらない", async () => {
      const round = createRound({
        id: "round-1",
        date: "2025-10-16",
        n: 9,
      });

      await repo.save(round);
      round.scores.push({ holeNumber: 1, strokes: 5 });

      const found = await repo.findById("round-1");
      expect(found?.scores).toHaveLength(0);
    });
  });

  describe("findById", () => {
    test("保存したラウンドをIDで取得できる", async () => {
      const round = createRound({
        id: "round-1",
        date: "2025-10-16",
        n: 9,
      });

      await repo.save(round);
      const found = await repo.findById("round-1");

      expect(found).toEqual(round);
    });

    test("存在しないIDの場合はnullを返す", async () => {
      const found = await repo.findById("non-existent");
      expect(found).toBeNull();
    });

    test("取得したオブジェクトを変更してもリポジトリ内のデータは変わらない", async () => {
      const round = createRound({
        id: "round-1",
        date: "2025-10-16",
        n: 9,
      });

      await repo.save(round);
      const found = await repo.findById("round-1");
      found!.scores.push({ holeNumber: 1, strokes: 5 });

      const foundAgain = await repo.findById("round-1");
      expect(foundAgain?.scores).toHaveLength(0);
    });
  });

  describe("findAll", () => {
    test("すべてのラウンドを取得できる", async () => {
      const round1 = createRound({
        id: "round-1",
        date: "2025-10-16",
        n: 9,
      });
      const round2 = createRound({
        id: "round-2",
        date: "2025-10-17",
        n: 18,
      });

      await repo.save(round1);
      await repo.save(round2);

      const all = await repo.findAll();
      expect(all).toHaveLength(2);
      expect(all.map(r => r.id)).toContain("round-1");
      expect(all.map(r => r.id)).toContain("round-2");
    });

    test("空の場合は空配列を返す", async () => {
      const all = await repo.findAll();
      expect(all).toEqual([]);
    });

    test("取得した配列の要素を変更してもリポジトリ内のデータは変わらない", async () => {
      const round = createRound({
        id: "round-1",
        date: "2025-10-16",
        n: 9,
      });

      await repo.save(round);
      const all = await repo.findAll();
      all[0].scores.push({ holeNumber: 1, strokes: 5 });

      const allAgain = await repo.findAll();
      expect(allAgain[0].scores).toHaveLength(0);
    });
  });

  describe("delete", () => {
    test("指定したIDのラウンドを削除できる", async () => {
      const round = createRound({
        id: "round-1",
        date: "2025-10-16",
        n: 9,
      });

      await repo.save(round);
      await repo.delete("round-1");

      const found = await repo.findById("round-1");
      expect(found).toBeNull();
    });

    test("存在しないIDを削除してもエラーにならない", async () => {
      await expect(repo.delete("non-existent")).resolves.toBeUndefined();
    });

    test("削除後に他のラウンドは残っている", async () => {
      const round1 = createRound({
        id: "round-1",
        date: "2025-10-16",
        n: 9,
      });
      const round2 = createRound({
        id: "round-2",
        date: "2025-10-17",
        n: 18,
      });

      await repo.save(round1);
      await repo.save(round2);
      await repo.delete("round-1");

      const all = await repo.findAll();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe("round-2");
    });
  });
});
