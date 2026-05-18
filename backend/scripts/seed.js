import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Same DNS fix as server.js — Windows system DNS refuses SRV queries
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Anmel Inc';

async function seed() {
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 20000,
    connectTimeoutMS: 20000,
    tls: true,
    family: 4,
  });
  const email = process.env.ADMIN_EMAIL || 'admin@anmelinc.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin user already exists:', email);
    process.exit(0);
    return;
  }
  await User.create({ email, password, name: 'Admin', role: 'admin' });
  console.log('Admin user created:', email);

  // Also seed demo admin if different
  const demoEmail = process.env.DEMO_ADMIN_EMAIL || 'demo.admin@anmelinc.com';
  const demoPassword = process.env.DEMO_ADMIN_PASSWORD || 'DemoAdmin@123';
  if (demoEmail !== email) {
    const demoExists = await User.findOne({ email: demoEmail });
    if (!demoExists) {
      await User.create({ email: demoEmail, password: demoPassword, name: 'Demo Admin', role: 'admin' });
      console.log('Demo admin created:', demoEmail);
    } else {
      console.log('Demo admin already exists:', demoEmail);
    }
  }

  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
