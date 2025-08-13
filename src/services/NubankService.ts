import axios, { AxiosInstance } from 'axios';
import { BoletoInfo, PixPayment, PaymentResult, BankConnection, NubankCredentials } from '../types';
import { logger } from '../utils/logger';

export class NubankService {
  private client: AxiosInstance;
  private credentials: NubankCredentials;
  private isAuthenticated: boolean = false;
  private authToken?: string;

  constructor(credentials: NubankCredentials) {
    this.credentials = credentials;
    this.client = axios.create({
      baseURL: 'https://prod-s0-webapp-proxy.nubank.com.br',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/json'
      }
    });
  }

  async connect(): Promise<BankConnection> {
    try {
      logger.info('Attempting to connect to Nubank API');
      
      // This is a simplified authentication flow
      // In a real implementation, you would need to handle Nubank's specific authentication
      const response = await this.client.post('/api/graphql', {
        query: `
          mutation {
            authenticate(input: {
              cpf: "${this.credentials.cpf}",
              password: "${this.credentials.password}"
            }) {
              token
            }
          }
        `
      });

      if (response.data?.data?.authenticate?.token) {
        this.authToken = response.data.data.authenticate.token;
        this.isAuthenticated = true;
        
        logger.info('Successfully connected to Nubank API');
        return {
          isConnected: true,
          lastConnectionTest: new Date()
        };
      }

      throw new Error('Authentication failed');
    } catch (error) {
      logger.error('Failed to connect to Nubank API:', error);
      return {
        isConnected: false,
        lastConnectionTest: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async payBoleto(boleto: BoletoInfo): Promise<PaymentResult> {
    try {
      if (!this.isAuthenticated) {
        throw new Error('Not authenticated with Nubank');
      }

      logger.info(`Attempting to pay boleto: ${boleto.id}`);

      // This is a simplified payment flow
      // In a real implementation, you would need to handle Nubank's specific payment API
      const response = await this.client.post('/api/bills/pay', {
        barcode: boleto.barcode,
        amount: boleto.amount
      }, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (response.data?.success) {
        logger.info(`Successfully paid boleto: ${boleto.id}`);
        return {
          success: true,
          transactionId: response.data.transactionId,
          timestamp: new Date()
        };
      }

      throw new Error('Payment failed');
    } catch (error) {
      logger.error(`Failed to pay boleto ${boleto.id}:`, error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  async performPixPayment(payment: PixPayment): Promise<PaymentResult> {
    try {
      if (!this.isAuthenticated) {
        throw new Error('Not authenticated with Nubank');
      }

      logger.info(`Attempting PIX payment: ${payment.id}`);

      // This is a simplified PIX payment flow
      const response = await this.client.post('/api/pix/pay', {
        pixKey: payment.pixKey,
        amount: payment.amount,
        description: payment.description
      }, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (response.data?.success) {
        logger.info(`Successfully completed PIX payment: ${payment.id}`);
        return {
          success: true,
          transactionId: response.data.transactionId,
          timestamp: new Date()
        };
      }

      throw new Error('PIX payment failed');
    } catch (error) {
      logger.error(`Failed to complete PIX payment ${payment.id}:`, error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  async disconnect(): Promise<void> {
    this.isAuthenticated = false;
    this.authToken = undefined;
    logger.info('Disconnected from Nubank API');
  }
}
