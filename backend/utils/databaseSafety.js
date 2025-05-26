const readline = require('readline');

class DatabaseSafety {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Check if current environment is production
   */
  isProduction() {
    const dbUrl = process.env.DATABASE_URL || '';
    const nodeEnv = process.env.NODE_ENV || '';
    
    // Check multiple indicators of production
    const productionIndicators = [
      dbUrl.includes('render.com'),
      dbUrl.includes('prod'),
      dbUrl.includes('production'),
      nodeEnv === 'production'
    ];
    
    // If it's localhost or 127.0.0.1, it's definitely NOT production
    const isLocalhost = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
    if (isLocalhost) {
      return false;
    }
    
    return productionIndicators.some(indicator => indicator);
  }

  /**
   * Get database name from connection string
   */
  getDatabaseName() {
    const dbUrl = process.env.DATABASE_URL || '';
    const match = dbUrl.match(/\/([^?]+)(\?|$)/);
    return match ? match[1] : 'unknown';
  }

  /**
   * Get database host from connection string
   */
  getDatabaseHost() {
    const dbUrl = process.env.DATABASE_URL || '';
    const match = dbUrl.match(/@([^:\/]+)/);
    return match ? match[1] : 'unknown';
  }

  /**
   * Require explicit confirmation for dangerous operations
   */
  async requireConfirmation(action, details = '') {
    return new Promise((resolve) => {
      console.log('\n' + '⚠️  '.repeat(10));
      console.log('⚠️  DANGEROUS OPERATION DETECTED!');
      console.log('⚠️  '.repeat(10));
      console.log(`\nAction: ${action}`);
      if (details) {
        console.log(`Details: ${details}`);
      }
      console.log(`\nDatabase: ${this.getDatabaseName()}`);
      console.log(`Host: ${this.getDatabaseHost()}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      
      this.rl.question('\nType "I UNDERSTAND THE RISKS" to proceed: ', (answer) => {
        resolve(answer === 'I UNDERSTAND THE RISKS');
      });
    });
  }

  /**
   * Require typing the database name to confirm
   */
  async requireDatabaseNameConfirmation() {
    const dbName = this.getDatabaseName();
    return new Promise((resolve) => {
      console.log(`\n🔒 Additional Safety Check`);
      console.log(`Type the database name "${dbName}" to confirm: `);
      
      this.rl.question('Database name: ', (answer) => {
        resolve(answer === dbName);
      });
    });
  }

  /**
   * Comprehensive safety check for destructive operations
   */
  async performSafetyCheck(operation, details = '') {
    if (!this.isProduction()) {
      console.log('✅ Running on development database');
      return true;
    }

    console.log('\n🚨 PRODUCTION DATABASE DETECTED! 🚨');
    
    // First confirmation
    const firstConfirm = await this.requireConfirmation(operation, details);
    if (!firstConfirm) {
      console.log('❌ Operation cancelled');
      this.close();
      return false;
    }

    // Second confirmation - type database name
    const secondConfirm = await this.requireDatabaseNameConfirmation();
    if (!secondConfirm) {
      console.log('❌ Database name mismatch - operation cancelled');
      this.close();
      return false;
    }

    // Final warning
    console.log('\n⚠️  FINAL WARNING ⚠️');
    console.log('This action CANNOT be undone!');
    console.log('Consider backing up your database first.');
    
    return new Promise((resolve) => {
      this.rl.question('\nType "PROCEED" to continue or anything else to cancel: ', (answer) => {
        const proceed = answer === 'PROCEED';
        if (!proceed) {
          console.log('❌ Operation cancelled');
        }
        this.close();
        resolve(proceed);
      });
    });
  }

  /**
   * Log dangerous operation attempt
   */
  logDangerousOperation(operation, proceeded, user = 'unknown') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      operation,
      database: this.getDatabaseName(),
      host: this.getDatabaseHost(),
      environment: process.env.NODE_ENV || 'development',
      proceeded,
      user
    };
    
    console.log('\n📝 Operation logged:', JSON.stringify(logEntry, null, 2));
    
    // In production, you might want to send this to a logging service
    // or write to a file
  }

  close() {
    this.rl.close();
  }
}

module.exports = DatabaseSafety; 