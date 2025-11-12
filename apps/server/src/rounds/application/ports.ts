import { Round } from "~/src/rounds/domain/entities";

export interface IRoundRepository {
  save(r: Round): Promise<void>;
  findById(id: string): Promise<Round | null>;
  findAll(): Promise<Round[]>;
  delete(id: string): Promise<void>
}
