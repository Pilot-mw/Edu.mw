require('dotenv').config();
const { getDb } = require('./db');

async function run() {
  try {
    const db = await getDb('test');
    await db.command({ ping: 1 });
    console.log('Connected and ready to use');
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

run();
