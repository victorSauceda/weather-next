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

import mongoose from 'mongoose';

const MONGODB_URI: string = process.env.NEXT_PUBLIC_MONGO_DB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used to maintain a cached connection across hot reloads in development. This prevents
 * connections from growing exponentially during API Route usage.
 */
interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: Cached;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
