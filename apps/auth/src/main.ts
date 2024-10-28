import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.TCP,
      options: { host: '127.0.0.1', port: 8877 }, // Ensure this is correct
    },
  );

  await app.listen(); // Ensure you start listening
  console.log(`Microservice is running on: tcp://127.0.0.1:8877`);
}

bootstrap();
