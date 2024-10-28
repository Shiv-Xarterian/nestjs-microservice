import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule implements OnModuleInit {
  private readonly logger = new Logger(UsersModule.name);

  onModuleInit() {
    this.logger.log('---------> UsersModule  sub app has been initialized.');
  }
}
