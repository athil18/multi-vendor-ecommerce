export class MockObjectId {
  private id: string;
  constructor(id?: string) {
    this.id = id || 'c' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  toString() {
    return this.id;
  }
}

export const mongoose = {
  Types: {
    ObjectId: MockObjectId,
  },
};

export default mongoose;
