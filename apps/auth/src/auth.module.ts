import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Auth, AuthSchema } from './schemas/auth.schema';
import { AuthDao } from './auth.dao';
import { JwtService } from '@nestjs/jwt';
import { RabbitMQService } from './rabbitmq/auth.rabbitmq';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO),
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
  ],
  providers: [AuthService, JwtService, AuthDao, RabbitMQService],
})
export class AuthModule {}
