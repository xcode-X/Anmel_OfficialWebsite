import bcrypt from 'bcryptjs';
import { db, COLLECTIONS, createDoc, findOne, updateDoc } from '../lib/firestoreDb.js';

const base = db(COLLECTIONS.users);

async function hashPassword(password) {
  return bcrypt.hash(String(password), 12);
}

const User = {
  ...base,
  async create(data) {
    const payload = { ...data };
    if (payload.password) {
      payload.password = await hashPassword(payload.password);
    }
    return createDoc(COLLECTIONS.users, payload);
  },
  async findOne(filter) {
    return findOne(COLLECTIONS.users, filter);
  },
  find: base.find.bind(base),
  findById: base.findById.bind(base),
  findByIdAndUpdate: base.findByIdAndUpdate.bind(base),
  findByIdAndDelete: base.findByIdAndDelete.bind(base),
  countDocuments: base.countDocuments.bind(base),
};

export default User;
