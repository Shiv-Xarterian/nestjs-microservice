import { Module, OnModuleInit } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule implements OnModuleInit {
  onModuleInit() {
    console.log('---------> PaymentsModule has been initialized.');
  }
}
