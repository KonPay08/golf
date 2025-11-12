import { IRoundRepository } from "~/rounds/application/ports";
import { Round } from "~/rounds/domain/entities";

export class RoundRepositoryInMemory implements IRoundRepository {
  #store = new Map<string, Round>();
  async save(r: Round) { 
    this.#store.set(r.id, structuredClone(r)); 
    return;
  }
  async findById(id: string) { 
    const v = this.#store.get(id); 
    return v ? structuredClone(v) : null; 
  }
  async findAll() { 
    return [...this.#store.values()].map(v => structuredClone(v)); 
  }
  async delete(id: string) { 
    this.#store.delete(id); 
    return;
  }
}
