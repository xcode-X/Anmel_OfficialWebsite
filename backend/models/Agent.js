import bcrypt from 'bcryptjs';
import { db, COLLECTIONS, createDoc, findOne, getById, updateDoc } from '../lib/firestoreDb.js';

const base = db(COLLECTIONS.agents);

async function hashPassword(password) {
  return bcrypt.hash(String(password), 12);
}

const Agent = {
  ...base,
  async create(data) {
    const payload = { ...data };
    if (payload.password) {
      payload.password = await hashPassword(payload.password);
    }
    return createDoc(COLLECTIONS.agents, payload);
  },
  async findOne(filter) {
    return findOne(COLLECTIONS.agents, filter);
  },
  find: base.find.bind(base),
  findById: base.findById.bind(base),
  findByIdAndUpdate: base.findByIdAndUpdate.bind(base),
  findByIdAndDelete: base.findByIdAndDelete.bind(base),
  comparePassword: async (plain, agent) => {
    const row = typeof agent === 'string' ? await getById(COLLECTIONS.agents, agent) : agent;
    if (!row?.password) return false;
    return bcrypt.compare(String(plain), row.password);
  },
};

export default Agent;
