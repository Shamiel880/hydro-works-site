// lib/prisma.ts - Optimized for Vercel serverless
import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Singleton pattern for Prisma client with serverless optimizations
export const prisma = global.__prisma || new PrismaClient({
  // Reduce logging in production for better performance
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  
  // Add connection pool settings for better serverless performance
  __internal: {
    engine: {
      connectionTimeout: 3000, // 3 seconds timeout
      maxMemory: '512MB',
    }
  }
});

// Only cache in development to avoid memory leaks in serverless
if (process.env.NODE_ENV === 'development') {
  global.__prisma = prisma;
}

// Enhanced connection management for serverless
export async function connectToDatabase() {
  try {
    // Use a simple query instead of $connect for faster connection testing
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Database connection failed:', {
      message: error.message,
      code: error.code,
      // Limit error details in production
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
    return false;
  }
}

export async function disconnectFromDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
  } catch (error: any) {
    console.error('❌ Database disconnect failed:', error.message);
  }
}

// Health check function for database
export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const duration = Date.now() - start;
    
    console.log(`Database health check passed in ${duration}ms`);
    return duration < 5000; // Consider healthy if responds within 5s
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Cleanup function for graceful shutdowns
export async function cleanupPrisma() {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error during Prisma cleanup:', error);
  }
}

// Export a function to get fresh client if needed
export function getFreshPrismaClient() {
  return new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
}