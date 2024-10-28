// import mongoose from 'mongoose';

// const MONGODB_URI: string = process.env.MONGO_DB_URI || '';

// if (!MONGODB_URI) {
//   throw new Error('Please define the MONGO_DB_URI environment variable inside .env.local');
// }

// // Log the first part of the URI to confirm if the correct one is being used (safely without credentials)
// console.log('Connecting to MongoDB at:', MONGODB_URI.split('@')[1]); // This will log the host portion

// /**
//  * Global is used to maintain a cached connection across hot reloads in development. This prevents
//  * connections from growing exponentially during API Route usage.
//  */
// interface Cached {
//   conn: typeof mongoose | null;
//   promise: Promise<typeof mongoose> | null;
// }

// declare global {
//   // eslint-disable-next-line no-var
//   var mongoose: Cached;
// }

// let cached = global.mongoose;

// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// async function dbConnect(): Promise<typeof mongoose> {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     const opts = {
//       bufferCommands: false,
//     };

//     cached.promise = mongoose.connect(MONGODB_URI, opts)
//       .then((mongoose) => {
//         console.log('Successfully connected to MongoDB');
//         return mongoose;
//       })
//       .catch((error) => {
//         console.error('Error connecting to MongoDB:', error.message);
//         console.error('Stack Trace:', error.stack);
//         throw new Error('MongoDB connection failed');
//       });
//   }
  
//   cached.conn = await cached.promise;
//   return cached.conn;
// }

// export default dbConnect;

import mongoose from 'mongoose'; // Import the Mongoose library for MongoDB interactions

// Retrieve the MongoDB URI from environment variables or default to an empty string
const MONGODB_URI: string = process.env.MONGO_DB_URI || '';

if (!MONGODB_URI) {
  // If no MongoDB URI is provided, throw an error and prompt the developer to set the environment variable
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Define a `Cached` interface to maintain a cached connection across hot reloads during development.
 * This helps prevent multiple database connections from being opened on each reload.
 */
interface Cached {
  conn: typeof mongoose | null; // Holds the Mongoose connection instance, or null if not yet connected
  promise: Promise<typeof mongoose> | null; // Holds a promise that resolves to the Mongoose connection, or null
}

// Declare a global variable to store the Mongoose cache (specific to Node.js global scope)
// This ensures that the cached connection is preserved across API route calls during development.
declare global {
  var mongoose: Cached; // Declare `mongoose` in the global namespace as `Cached`
}

// Initialize the cached connection if it's not already set in the global namespace
let cached = global.mongoose;

if (!cached) {
  // If no cached connection exists, initialize it with null values for `conn` and `promise`
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * `dbConnect` is an asynchronous function that manages the connection to the MongoDB database.
 * It caches the connection during development to avoid creating new connections on each API call.
 */
async function dbConnect(): Promise<typeof mongoose> {
  // If a cached connection already exists, return it to avoid reconnecting
  if (cached.conn) {
    return cached.conn;
  }

  // If there's no connection, but a promise exists, use the cached promise to establish the connection
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose buffering of commands while the connection is opening
    };

    // Set the cached promise to establish a new Mongoose connection
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose; // Return the connected Mongoose instance
    });
  }

  // Await the connection promise and store the result in the cached connection
  cached.conn = await cached.promise;
  return cached.conn; // Return the connected Mongoose instance
}

export default dbConnect; // Export the `dbConnect` function to be used in other parts of the application
