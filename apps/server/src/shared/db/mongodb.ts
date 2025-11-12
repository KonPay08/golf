import { MongoClient, Db } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToMongoDB(uri: string): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db(); // Uses database from connection string

  cachedClient = client;
  cachedDb = db;

  console.log("✅ Connected to MongoDB");

  return { client, db };
}

export async function closeMongoDB(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log("✅ MongoDB connection closed");
  }
}
