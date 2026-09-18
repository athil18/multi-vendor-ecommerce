/**
 * Transaction Manager Port Interface
 * 
 * @agent engineering-database-reliability-engineer
 * @agent engineering-backend-architect
 */

// This interface provides an opaque token that infrastructure adapters can use.
// Core domain services never inspect this token, they just pass it back to Repositories.
export interface ITransactionContext {
  [key: string]: any;
}

export interface ITransactionManager {
  executeInTransaction<T>(work: (ctx: ITransactionContext) => Promise<T>): Promise<T>;
}
