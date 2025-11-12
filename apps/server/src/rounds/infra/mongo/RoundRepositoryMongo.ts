import { Collection, Db } from "mongodb";
import { IRoundRepository } from "~/src/rounds/application/ports";
import { Round } from "~/src/rounds/domain/entities";

type RoundDocument = Omit<Round, "id"> & { _id: string };

export class RoundRepositoryMongo implements IRoundRepository {
  #collection: Collection<RoundDocument>;

  constructor(db: Db) {
    this.#collection = db.collection<RoundDocument>("rounds");
  }

  async save(r: Round): Promise<void> {
    const doc: RoundDocument = {
      _id: r.id,
      date: r.date,
      n: r.n,
      holes: r.holes,
      scores: r.scores,
      courseName: r.courseName,
    };

    await this.#collection.updateOne(
      { _id: doc._id },
      { $set: doc },
      { upsert: true }
    );
  }

  async findById(id: string): Promise<Round | null> {
    const doc = await this.#collection.findOne({ _id: id });
    if (!doc) return null;

    return {
      id: doc._id,
      date: doc.date,
      n: doc.n,
      holes: doc.holes,
      scores: doc.scores,
      courseName: doc.courseName,
    };
  }

  async findAll(): Promise<Round[]> {
    const docs = await this.#collection.find({}).toArray();

    return docs.map((doc) => ({
      id: doc._id,
      date: doc.date,
      n: doc.n,
      holes: doc.holes,
      scores: doc.scores,
      courseName: doc.courseName,
    }));
  }

  async delete(id: string): Promise<void> {
    await this.#collection.deleteOne({ _id: id });
  }
}
