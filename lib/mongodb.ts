import { MongoClient } from 'mongodb';

const uri: string = process.env.MONGO_DB_URI || ''; // MongoDB connection string

if (!uri) {
  throw new Error('Please define the MONGO_DB_URI environment variable inside .env.local');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Declare a global variable for the cached client in development mode
declare global {
  // Allow for global MongoClient promise caching in development
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // In development, use the global variable to store the MongoClient promise
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new client for every connection
  // You may use the same client across requests in production by caching it as well
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
