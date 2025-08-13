import { PaymentScheduler } from '../services/PaymentScheduler';
import { PaymentRepository } from '../services/PaymentRepository';
import { BoletoInfo, PixPayment, PaymentStatus } from '../types';
import { logger } from '../utils/logger';

export class PaymentController {
  private paymentScheduler: PaymentScheduler;
  private paymentRepository: PaymentRepository;

  constructor() {
    this.paymentScheduler = new PaymentScheduler();
    this.paymentRepository = new PaymentRepository();
  }

  async getAllPayments(): Promise<(BoletoInfo | PixPayment)[]> {
    try {
      return await this.paymentRepository.getAllPayments();
    } catch (error) {
      logger.error('Error getting all payments:', error);
      throw error;
    }
  }

  async getPendingPayments(): Promise<(BoletoInfo | PixPayment)[]> {
    try {
      return await this.paymentRepository.getPendingPayments();
    } catch (error) {
      logger.error('Error getting pending payments:', error);
      throw error;
    }
  }

  async triggerPayment(paymentId: string): Promise<void> {
    try {
      await this.paymentScheduler.triggerPayment(paymentId);
    } catch (error) {
      logger.error(`Error triggering payment ${paymentId}:`, error);
      throw error;
    }
  }

  async addBoleto(boletoData: Omit<BoletoInfo, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const boleto: BoletoInfo = {
        ...boletoData,
        id: `boleto-${Date.now()}`,
        status: PaymentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.paymentRepository.addPayment(boleto);
      logger.info(`Added new boleto: ${boleto.id}`);
      return boleto.id;
    } catch (error) {
      logger.error('Error adding boleto:', error);
      throw error;
    }
  }

  async addPixPayment(pixData: Omit<PixPayment, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const pixPayment: PixPayment = {
        ...pixData,
        id: `pix-${Date.now()}`,
        status: PaymentStatus.SCHEDULED,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.paymentRepository.addPayment(pixPayment);
      logger.info(`Added new PIX payment: ${pixPayment.id}`);
      return pixPayment.id;
    } catch (error) {
      logger.error('Error adding PIX payment:', error);
      throw error;
    }
  }

  async cancelPayment(paymentId: string): Promise<void> {
    try {
      await this.paymentRepository.updatePaymentStatus(paymentId, PaymentStatus.CANCELLED);
      logger.info(`Cancelled payment: ${paymentId}`);
    } catch (error) {
      logger.error(`Error cancelling payment ${paymentId}:`, error);
      throw error;
    }
  }

  async getPaymentStatus(): Promise<(BoletoInfo | PixPayment)[]> {
    try {
      return await this.paymentScheduler.getPaymentStatus();
    } catch (error) {
      logger.error('Error getting payment status:', error);
      throw error;
    }
  }
}
