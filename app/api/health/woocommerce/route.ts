// api/health/woocommerce/route.ts
// Create this health check endpoint to monitor WooCommerce API performance

import { NextRequest, NextResponse } from "next/server";
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

export async function GET(req: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    woocommerce: {
      status: 'unknown',
      responseTime: 0,
      error: null as any
    },
    database: {
      status: 'unknown', 
      responseTime: 0,
      error: null as any
    },
    overall: 'unknown'
  };

  // Test WooCommerce API
  try {
    const api = new WooCommerceRestApi({
      url: "https://backend.hydroworks.co.za/wp",
      consumerKey: process.env.WC_API_KEY!,
      consumerSecret: process.env.WC_API_SECRET!,
      version: "wc/v3",
      timeout: 10000,
    });

    const startTime = Date.now();
    
    // Simple API test - get system status
    const { data } = await api.get("system_status");
    
    results.woocommerce.responseTime = Date.now() - startTime;
    results.woocommerce.status = 'healthy';
    
  } catch (error: any) {
    results.woocommerce.status = 'unhealthy';
    results.woocommerce.error = {
      message: error.message,
      status: error.response?.status,
      code: error.code
    };
  }

  // Test Database
  try {
    const { prisma } = await import('@/lib/prisma');
    
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    results.database.responseTime = Date.now() - startTime;
    results.database.status = 'healthy';
    
  } catch (error: any) {
    results.database.status = 'unhealthy';
    results.database.error = {
      message: error.message,
      code: error.code
    };
  }

  // Overall status
  results.overall = (results.woocommerce.status === 'healthy' && results.database.status === 'healthy') 
    ? 'healthy' 
    : 'degraded';

  const statusCode = results.overall === 'healthy' ? 200 : 503;
  
  return NextResponse.json(results, { status: statusCode });
}

// Performance tracking utility
export class WooCommerceMonitor {
  private static instance: WooCommerceMonitor;
  private metrics: {
    requests: number;
    failures: number;
    totalResponseTime: number;
    slowRequests: number;
    lastFailure: Date | null;
    consecutiveFailures: number;
  } = {
    requests: 0,
    failures: 0,
    totalResponseTime: 0,
    slowRequests: 0,
    lastFailure: null,
    consecutiveFailures: 0
  };

  static getInstance(): WooCommerceMonitor {
    if (!WooCommerceMonitor.instance) {
      WooCommerceMonitor.instance = new WooCommerceMonitor();
    }
    return WooCommerceMonitor.instance;
  }

  recordRequest(responseTime: number, success: boolean) {
    this.metrics.requests++;
    this.metrics.totalResponseTime += responseTime;
    
    if (!success) {
      this.metrics.failures++;
      this.metrics.lastFailure = new Date();
      this.metrics.consecutiveFailures++;
    } else {
      this.metrics.consecutiveFailures = 0;
    }
    
    if (responseTime > 10000) { // Slow request > 10s
      this.metrics.slowRequests++;
    }
  }

  getStats() {
    return {
      ...this.metrics,
      avgResponseTime: this.metrics.requests > 0 
        ? Math.round(this.metrics.totalResponseTime / this.metrics.requests)
        : 0,
      successRate: this.metrics.requests > 0
        ? Math.round(((this.metrics.requests - this.metrics.failures) / this.metrics.requests) * 100)
        : 0,
      isHealthy: this.metrics.consecutiveFailures < 3
    };
  }

  reset() {
    this.metrics = {
      requests: 0,
      failures: 0,
      totalResponseTime: 0,
      slowRequests: 0,
      lastFailure: null,
      consecutiveFailures: 0
    };
  }
}

// Enhanced WooCommerce API wrapper with monitoring
export class MonitoredWooCommerceApi {
  private api: any;
  private monitor: WooCommerceMonitor;

  constructor() {
    this.api = new WooCommerceRestApi({
      url: "https://backend.hydroworks.co.za/wp",
      consumerKey: process.env.WC_API_KEY!,
      consumerSecret: process.env.WC_API_SECRET!,
      version: "wc/v3",
      timeout: 20000,
      axiosConfig: {
        headers: {
          'Connection': 'keep-alive',
          'Keep-Alive': 'timeout=20, max=1000'
        }
      }
    });
    
    this.monitor = WooCommerceMonitor.getInstance();
  }

  async post(endpoint: string, data: any, retries = 3): Promise<any> {
    let lastError: any = null;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      const startTime = Date.now();
      
      try {
        console.log(`WooCommerce API ${endpoint} attempt ${attempt}/${retries}`);
        
        if (attempt > 1) {
          const delay = Math.min((attempt - 1) * 2000, 5000) + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        const response = await this.api.post(endpoint, data);
        const responseTime = Date.now() - startTime;
        
        this.monitor.recordRequest(responseTime, true);
        
        console.log(`WooCommerce API success on attempt ${attempt} (${responseTime}ms)`);
        return response;
        
      } catch (error: any) {
        const responseTime = Date.now() - startTime;
        lastError = error;
        
        this.monitor.recordRequest(responseTime, false);
        
        const isRetryable = this.isRetryableError(error);
        
        console.warn(`WooCommerce API attempt ${attempt} failed (${responseTime}ms)`, {
          error: error.message,
          status: error.response?.status,
          isRetryable,
          stats: this.monitor.getStats()
        });
        
        if (!isRetryable || attempt === retries) {
          throw error;
        }
      }
    }
    
    throw lastError;
  }

  private isRetryableError(error: any): boolean {
    if (!error.response) return true;
    
    const status = error.response.status;
    const retryableStatuses = [408, 429, 500, 502, 503, 504, 520, 522, 524];
    
    return retryableStatuses.includes(status);
  }

  getMonitoringStats() {
    return this.monitor.getStats();
  }
}