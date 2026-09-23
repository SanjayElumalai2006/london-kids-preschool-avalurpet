import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Connect to MongoDB with caching optimized for Vercel serverless environments.
 * Reuses existing connections across function invocations and prevents connection leaks.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // If connection is already open and ready, reuse it immediately
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  if (cached.conn) {
    return cached.conn;
  }

  // In production (Vercel), MONGODB_URI MUST be set to cloud Atlas cluster
  const uri = MONGODB_URI || (process.env.NODE_ENV === 'production' 
    ? '' 
    : 'mongodb://127.0.0.1:27017/londonkids_preschool');

  if (!uri) {
    throw new Error(
      'MONGODB_URI environment variable is missing. Please configure your MongoDB Atlas connection string in your Vercel Project Settings (Environment Variables).'
    );
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000, // Prevent serverless functions from hanging
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
