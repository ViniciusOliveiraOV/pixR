import dotenv from 'dotenv';
import { PaymentScheduler } from './services/PaymentScheduler';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

async function main() {
  try {
    logger.info('Starting PIX Payment Automation Service');
    
    const scheduler = new PaymentScheduler();
    await scheduler.start();
    
    logger.info('Payment automation service is running');
    
    // Keep the process running
    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully');
      await scheduler.stop();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully');
      await scheduler.stop();
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('Failed to start payment automation service:', error);
    process.exit(1);
  }
}

main();
