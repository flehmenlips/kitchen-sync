/**
 * Database Configuration
 * 
 * Centralizes database configuration and environment detection
 */

const PRODUCTION_INDICATORS = [
  'render.com',
  'amazonaws.com',
  'heroku',
  'railway.app',
  'fly.io'
];

const SAFE_TEST_DATABASES = [
  'localhost',
  '127.0.0.1',
  'test',
  'development'
];

class DatabaseConfig {
  static isProduction() {
    const dbUrl = process.env.DATABASE_URL || '';
    const nodeEnv = process.env.NODE_ENV || '';
    
    // Explicit production check
    if (nodeEnv === 'production') return true;
    
    // Check if URL contains production indicators
    return PRODUCTION_INDICATORS.some(indicator => 
      dbUrl.toLowerCase().includes(indicator)
    );
  }
  
  static isDevelopment() {
    const dbUrl = process.env.DATABASE_URL || '';
    
    return SAFE_TEST_DATABASES.some(indicator => 
      dbUrl.toLowerCase().includes(indicator)
    );
  }
  
  static requireProductionFlag() {
    if (this.isProduction() && process.env.ALLOW_PRODUCTION_CHANGES !== 'true') {
      throw new Error(
        'Production database modifications are disabled. ' +
        'Set ALLOW_PRODUCTION_CHANGES=true to proceed (NOT RECOMMENDED).'
      );
    }
  }
  
  static getConfig() {
    return {
      isProduction: this.isProduction(),
      isDevelopment: this.isDevelopment(),
      databaseUrl: process.env.DATABASE_URL,
      environment: process.env.NODE_ENV || 'development',
      allowProductionChanges: process.env.ALLOW_PRODUCTION_CHANGES === 'true'
    };
  }
}

module.exports = DatabaseConfig; 