import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/users').then(setUsers).catch(() => setUsers([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Users</h1>
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10">
              <th className="p-4 text-neutral-400 font-medium">Email</th>
              <th className="p-4 text-neutral-400 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-white/5">
                <td className="p-4 text-white">{u.email}</td>
                <td className="p-4 text-neutral-300">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-neutral-500">User creation is done via server seed script (see server/scripts/seed.js).</p>
    </div>
  );
}


