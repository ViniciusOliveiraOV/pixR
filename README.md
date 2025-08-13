# PIX Payment Automation Service

An automated payment system for PIX and boletos with Nubank integration, based on Node.js and TypeScript.

## 🚀 Features

- **Automated Payment Processing**: Schedule and automatically process PIX payments and boletos
- **Nubank Integration**: Connect with Nubank API for secure payment execution
- **Smart Scheduling**: Cron-based scheduling for payment processing
- **Retry Logic**: Automatic retry mechanism for failed payments
- **Comprehensive Logging**: Detailed logging for monitoring and debugging
- **Payment Status Tracking**: Track payment lifecycle from pending to completion

## 📋 System Flow

Based on the flowchart, the system follows this process:

1. **Information Reading**: Reads ticket/payment information
2. **Scheduled Execution**: Executes payment functions automatically according to schedule
3. **Payment Processing**: Checks if script executed payment successfully
4. **Data Processing**: Processes ticket data or marks as paid in the system
5. **Bank API Integration**: Connects with bank API for payment execution
6. **Automatic Payment**: Attempts automatic payment through script

## 🏗️ Project Structure

```
src/
├── types/           # TypeScript type definitions
├── services/        # Business logic services
│   ├── NubankService.ts      # Nubank API integration
│   ├── PaymentRepository.ts  # Payment data management
│   └── PaymentScheduler.ts   # Scheduling and automation
├── controllers/     # Application controllers
├── cli/            # Command line interface
├── utils/          # Utility functions
└── index.ts        # Application entry point
```

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pixR
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your Nubank credentials and configuration.

## ⚙️ Configuration

### Environment Variables

- `NUBANK_CPF`: Your CPF for Nubank authentication
- `NUBANK_PASSWORD`: Your Nubank password
- `NUBANK_CERT_PATH`: Path to your Nubank certificate (optional)
- `NUBANK_CERT_PASSWORD`: Certificate password (optional)
- `PAYMENT_CHECK_CRON`: Cron pattern for payment checks (default: daily at 9 AM)
- `RETRY_ATTEMPTS`: Number of retry attempts for failed payments (default: 3)
- `RETRY_DELAY_MS`: Delay between retry attempts in milliseconds (default: 5000)

### Cron Schedule Examples

- `0 9 * * *` - Daily at 9:00 AM
- `0 9,15 * * *` - Daily at 9:00 AM and 3:00 PM
- `0 9 * * 1-5` - Weekdays at 9:00 AM

## 🚀 Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Available Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run in development mode with ts-node
- `npm start` - Run compiled JavaScript
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## 🔧 API Usage

### Adding a Boleto
```typescript
import { PaymentController } from './src/controllers/PaymentController';

const controller = new PaymentController();

await controller.addBoleto({
  barcode: '03399.66290 60000.001014 41000.063305 8 84410000010000',
  amount: 150.00,
  dueDate: new Date('2025-02-15'),
  beneficiary: 'Energia Elétrica SP',
  description: 'Conta de luz - Janeiro 2025'
});
```

### Adding a PIX Payment
```typescript
await controller.addPixPayment({
  pixKey: 'exemplo@email.com',
  amount: 500.00,
  description: 'Pagamento de aluguel',
  recipientName: 'João Silva',
  scheduledDate: new Date('2025-01-20')
});
```

### Manual Payment Trigger
```typescript
await controller.triggerPayment('payment-id');
```

## 🔒 Security Considerations

⚠️ **Important Security Notes:**

1. **API Integration**: This is a simplified implementation. Real Nubank API integration requires:
   - Official API access (if available)
   - Proper authentication mechanisms
   - Compliance with banking regulations

2. **Credentials**: Never commit credentials to version control
3. **Certificate Management**: Store certificates securely
4. **Environment Isolation**: Use different environments for development/production

## 📊 Payment Status

The system tracks payments through these statuses:
- `PENDING` - Payment created, waiting to be processed
- `SCHEDULED` - Payment scheduled for future processing
- `PROCESSING` - Payment currently being processed
- `SUCCESS` - Payment completed successfully
- `FAILED` - Payment failed after retry attempts
- `CANCELLED` - Payment cancelled by user

## 🔄 Retry Logic

Failed payments are automatically retried with:
- Configurable retry attempts (default: 3)
- Exponential backoff delay
- Detailed error logging
- Final status update after all attempts

## 📝 Logging

The application uses Winston for comprehensive logging:
- Error logs: `logs/error.log`
- Combined logs: `logs/combined.log`
- Console output in development mode

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 📞 Support

For issues and questions:
1. Check the logs for detailed error information
2. Verify environment configuration
3. Ensure proper Nubank credentials and API access

## ⚖️ Legal Notice

This software is for educational and automation purposes. Ensure compliance with:
- Banking terms of service
- Local financial regulations
- Data privacy laws

## 🔮 Future Enhancements

- Support for additional banks (Itaú, Caixa)
- Web dashboard for payment management
- Database integration
- Enhanced security features
- Real-time notifications
- Payment scheduling UI
