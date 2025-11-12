import { MongoClient, Db } from "mongodb";
import { RoundRepositoryMongo } from "~/rounds/infra/mongo/RoundRepositoryMongo";
import { Round } from "~/rounds/domain/entities";

describe("RoundRepositoryMongo", () => {
  let client: MongoClient;
  let db: Db;
  let repo: RoundRepositoryMongo;

  beforeAll(async () => {
    // Use in-memory MongoDB or test database
    const uri = process.env.MONGODB_TEST_URI || "mongodb://localhost:27017";
    client = new MongoClient(uri);
    await client.connect();
    db = client.db("golf_test");
    repo = new RoundRepositoryMongo(db);
  });

  afterAll(async () => {
    await client.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await db.collection("rounds").deleteMany({});
  });

  describe("save", () => {
    it("should save a new round", async () => {
      const round: Round = {
        id: "test-id-1",
        date: "2025-01-10",
        n: 18,
        holes: [
          { number: 1, par: 4 },
          { number: 2, par: 3 },
        ],
        scores: [],
        courseName: "Test Course",
      };

      await repo.save(round);

      const saved = await repo.findById("test-id-1");
      expect(saved).toEqual(round);
    });

    it("should update an existing round (upsert)", async () => {
      const round: Round = {
        id: "test-id-2",
        date: "2025-01-10",
        n: 18,
        holes: [{ number: 1, par: 4 }],
        scores: [],
      };

      await repo.save(round);

      // Update with new scores
      const updated: Round = {
        ...round,
        scores: [{ holeNumber: 1, strokes: 5 }],
      };

      await repo.save(updated);

      const saved = await repo.findById("test-id-2");
      expect(saved?.scores).toEqual([{ holeNumber: 1, strokes: 5 }]);
    });
  });

  describe("findById", () => {
    it("should return round if exists", async () => {
      const round: Round = {
        id: "test-id-3",
        date: "2025-01-10",
        n: 18,
        holes: [],
        scores: [],
      };

      await repo.save(round);

      const found = await repo.findById("test-id-3");
      expect(found).toEqual(round);
    });

    it("should return null if not found", async () => {
      const found = await repo.findById("non-existent");
      expect(found).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should return all rounds", async () => {
      const round1: Round = {
        id: "test-id-4",
        date: "2025-01-10",
        n: 18,
        holes: [],
        scores: [],
      };

      const round2: Round = {
        id: "test-id-5",
        date: "2025-01-11",
        n: 9,
        holes: [],
        scores: [],
      };

      await repo.save(round1);
      await repo.save(round2);

      const all = await repo.findAll();
      expect(all).toHaveLength(2);
      expect(all).toEqual(expect.arrayContaining([round1, round2]));
    });

    it("should return empty array if no rounds", async () => {
      const all = await repo.findAll();
      expect(all).toEqual([]);
    });
  });

  describe("delete", () => {
    it("should delete a round", async () => {
      const round: Round = {
        id: "test-id-6",
        date: "2025-01-10",
        n: 18,
        holes: [],
        scores: [],
      };

      await repo.save(round);
      await repo.delete("test-id-6");

      const found = await repo.findById("test-id-6");
      expect(found).toBeNull();
    });

    it("should not throw error if round does not exist", async () => {
      await expect(repo.delete("non-existent")).resolves.not.toThrow();
    });
  });
});
