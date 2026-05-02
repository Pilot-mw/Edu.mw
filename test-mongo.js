import { MongoClient } from 'mongodb';

const uri = 'mongodb://admin:vUzlkHKjNPnvScv7Bs56@cluster0-shard-00-00.jduju2p.mongodb.net:27017,cluster0-shard-00-01.jduju2p.mongodb.net:27017,cluster0-shard-00-02.jduju2p.mongodb.net:27017/?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

try {
  await client.connect();
  await client.db('admin').command({ ping: 1 });
  console.log('Successfully connected to MongoDB Atlas!');
} catch (err) {
  console.error('Connection failed:', err.message);
} finally {
  await client.close();
}
