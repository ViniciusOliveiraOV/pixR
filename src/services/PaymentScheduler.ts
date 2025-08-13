import { CronJob } from 'cron';
import { NubankService } from './NubankService';
import { PaymentRepository } from './PaymentRepository';
import { BoletoInfo, PixPayment, PaymentStatus, NubankCredentials } from '../types';
import { logger } from '../utils/logger';

export class PaymentScheduler {
  private cronJob?: CronJob;
  private nubankService: NubankService;
  private paymentRepository: PaymentRepository;
  private retryAttempts: number;
  private retryDelay: number;

  constructor() {
    const credentials: NubankCredentials = {
      cpf: process.env.NUBANK_CPF || '',
      password: process.env.NUBANK_PASSWORD || '',
      certPath: process.env.NUBANK_CERT_PATH,
      certPassword: process.env.NUBANK_CERT_PASSWORD
    };

    this.nubankService = new NubankService(credentials);
    this.paymentRepository = new PaymentRepository();
    this.retryAttempts = parseInt(process.env.RETRY_ATTEMPTS || '3');
    this.retryDelay = parseInt(process.env.RETRY_DELAY_MS || '5000');
  }

  async start(): Promise<void> {
    try {
      logger.info('Starting payment scheduler');
      
      // Test connection to Nubank
      const connection = await this.nubankService.connect();
      if (!connection.isConnected) {
        throw new Error(`Failed to connect to Nubank: ${connection.errorMessage}`);
      }

      // Set up cron job for daily payment checks
      const cronPattern = process.env.PAYMENT_CHECK_CRON || '0 9 * * *'; // Daily at 9 AM
      this.cronJob = new CronJob(cronPattern, () => {
        this.processScheduledPayments();
      });

      this.cronJob.start();
      logger.info(`Payment scheduler started with pattern: ${cronPattern}`);

      // Run initial check
      await this.processScheduledPayments();
    } catch (error) {
      logger.error('Failed to start payment scheduler:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.cronJob) {
      this.cronJob.stop();
      logger.info('Payment scheduler stopped');
    }
    await this.nubankService.disconnect();
  }

  private async processScheduledPayments(): Promise<void> {
    try {
      logger.info('Processing scheduled payments');

      const duePayments = await this.paymentRepository.getPaymentsDueToday();
      
      if (duePayments.length === 0) {
        logger.info('No payments due today');
        return;
      }

      for (const payment of duePayments) {
        await this.processPayment(payment);
      }

      logger.info('Finished processing scheduled payments');
    } catch (error) {
      logger.error('Error processing scheduled payments:', error);
    }
  }

  private async processPayment(payment: BoletoInfo | PixPayment): Promise<void> {
    let attempts = 0;
    
    while (attempts < this.retryAttempts) {
      try {
        await this.paymentRepository.updatePaymentStatus(payment.id, PaymentStatus.PROCESSING);
        
        let result;
        if ('barcode' in payment) {
          // It's a boleto
          result = await this.nubankService.payBoleto(payment as BoletoInfo);
        } else {
          // It's a PIX payment
          result = await this.nubankService.performPixPayment(payment as PixPayment);
        }

        if (result.success) {
          await this.paymentRepository.updatePaymentStatus(payment.id, PaymentStatus.SUCCESS);
          logger.info(`Payment ${payment.id} completed successfully. Transaction ID: ${result.transactionId}`);
          return; // Success, no need to retry
        } else {
          throw new Error(result.errorMessage || 'Payment failed');
        }
      } catch (error) {
        attempts++;
        logger.error(`Payment attempt ${attempts} failed for ${payment.id}:`, error);
        
        if (attempts < this.retryAttempts) {
          logger.info(`Retrying payment ${payment.id} in ${this.retryDelay}ms`);
          await this.delay(this.retryDelay);
        } else {
          // All attempts failed
          await this.paymentRepository.updatePaymentStatus(payment.id, PaymentStatus.FAILED);
          logger.error(`Payment ${payment.id} failed after ${this.retryAttempts} attempts`);
        }
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Manual payment trigger for testing
  async triggerPayment(paymentId: string): Promise<void> {
    try {
      const payment = await this.paymentRepository.getPaymentById(paymentId);
      if (!payment) {
        throw new Error(`Payment not found: ${paymentId}`);
      }

      await this.processPayment(payment);
    } catch (error) {
      logger.error(`Failed to trigger payment ${paymentId}:`, error);
      throw error;
    }
  }

  // Get current status of all payments
  async getPaymentStatus(): Promise<(BoletoInfo | PixPayment)[]> {
    return await this.paymentRepository.getAllPayments();
  }
}
