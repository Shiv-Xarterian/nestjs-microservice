import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQService } from './rabbitmq/auth.rabbitmq';
import { AuthController } from './auth.controller';

@Module({
  providers: [RabbitMQService],
  controllers: [AuthController],
})
export class UsersModule {}
