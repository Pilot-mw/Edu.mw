const { MongoClient, ServerApiVersion } = require('mongodb');
const dns = require('dns');

// Fix Node.js v24 DNS issue on Windows
dns.setServers(['8.8.8.8', '1.1.1.1']);

let cachedClient = null;

async function getDb(dbName = 'Cluster0') {
  if (cachedClient) {
    return cachedClient.db(dbName);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  await client.connect();
  cachedClient = client;
  return client.db(dbName);
}

module.exports = { getDb };
