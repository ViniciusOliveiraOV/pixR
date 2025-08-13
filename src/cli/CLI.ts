import { PaymentController } from '../controllers/PaymentController';
import { logger } from '../utils/logger';

export class CLI {
  private paymentController: PaymentController;

  constructor() {
    this.paymentController = new PaymentController();
  }

  async run(): Promise<void> {
    console.log('=== PIX Payment Automation CLI ===\n');
    
    try {
      await this.showMenu();
    } catch (error) {
      logger.error('CLI error:', error);
      console.error('An error occurred:', error);
    }
  }

  private async showMenu(): Promise<void> {
    console.log('Available commands:');
    console.log('1. View all payments');
    console.log('2. View pending payments');
    console.log('3. Add sample boleto');
    console.log('4. Add sample PIX payment');
    console.log('5. Trigger payment manually');
    console.log('6. Exit\n');

    // In a real CLI, you would read user input here
    // For now, let's demonstrate with some actions
    await this.demonstrateFeatures();
  }

  private async demonstrateFeatures(): Promise<void> {
    console.log('🔄 Demonstrating payment automation features...\n');

    // Show current payments
    console.log('📋 Current payments:');
    const allPayments = await this.paymentController.getAllPayments();
    allPayments.forEach(payment => {
      if ('barcode' in payment) {
        console.log(`  - Boleto ${payment.id}: R$ ${payment.amount} (${payment.beneficiary}) - ${payment.status}`);
      } else {
        console.log(`  - PIX ${payment.id}: R$ ${payment.amount} (${payment.recipientName}) - ${payment.status}`);
      }
    });

    console.log('\n📝 Adding a new boleto...');
    await this.paymentController.addBoleto({
      barcode: '03399.12345 67890.123456 78901.234567 8 84410000050000',
      amount: 75.50,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      beneficiary: 'Água e Esgoto SP',
      description: 'Conta de água - Janeiro 2025'
    });

    console.log('✅ Boleto added successfully!');

    console.log('\n📝 Adding a new PIX payment...');
    await this.paymentController.addPixPayment({
      pixKey: '+5511999999999',
      amount: 200.00,
      description: 'Pagamento freelancer',
      recipientName: 'Maria Santos',
      scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // Tomorrow
    });

    console.log('✅ PIX payment added successfully!');

    // Show updated payments
    console.log('\n📋 Updated payments list:');
    const updatedPayments = await this.paymentController.getAllPayments();
    updatedPayments.forEach(payment => {
      if ('barcode' in payment) {
        console.log(`  - Boleto ${payment.id}: R$ ${payment.amount} (${payment.beneficiary}) - ${payment.status}`);
      } else {
        console.log(`  - PIX ${payment.id}: R$ ${payment.amount} (${payment.recipientName}) - ${payment.status}`);
      }
    });

    console.log('\n💡 Payment automation is running in the background.');
    console.log('💡 Payments will be automatically processed according to their due dates.');
    console.log('💡 Check the logs for detailed information about payment processing.');
  }
}
