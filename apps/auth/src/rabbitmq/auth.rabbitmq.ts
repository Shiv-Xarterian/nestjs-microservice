import {
  Injectable,
  OnModuleInit,
  Logger,
  HttpStatus,
  HttpException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import amqp, { Channel, ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { AuthService } from '../auth.service';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private channelWrapper: ChannelWrapper;
  private readonly logger = new Logger(RabbitMQService.name);
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly service: AuthService,
  ) {
    const host = process.env.RABBITMQ_HOST;
    const port = process.env.RABBITMQ_PORT;
    const username = process.env.RABBITMQ_USERNAME;
    const password = process.env.RABBITMQ_PASSWORD;

    const connectionString = `amqp://${username}:${password}@${host}:${port}`;
    const connection = amqp.connect(connectionString);

    this.channelWrapper = connection.createChannel({
      setup: (channel: Channel) => {
        return Promise.all([
          channel.assertExchange(
            process.env.AUTHEXCHANGENAME,
            process.env.EXCHANGETYPE,
            {
              durable: true,
            },
          ),
          // create multiple exchnages
          channel.assertQueue('Authenticate_Queue_Request', { durable: true }),
          channel.assertQueue('Authenticate_Queue_Response', { durable: true }),
          channel.bindQueue(
            'Authenticate_Queue_Request',
            process.env.AUTHEXCHANGENAME,
            process.env.AUTHKEYREQ,
          ),
          channel.bindQueue(
            'Authenticate_Queue_Response',
            process.env.AUTHEXCHANGENAME,
            process.env.AUTHKEYRES,
          ),
        ]);
      },
    });
  }

  public async onModuleInit() {
    this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
      await channel.consume('Authenticate_Queue_Request', async (payload) => {
        if (payload) {
          const r = JSON.parse(payload.content.toString());
          const routingKey = r.key;
          switch (routingKey) {
            case 'login':
              this.service.loginUser(r.body, r.uuid);
              break;
            case 'register':
              this.service.registerUser(r.body, r.uuid);
              break;
            default:
              console.log(`Unknown message type: ${routingKey}`);
          }
          channel.ack(payload);
        }
      });
    });
  }

  async onModuleDestroy() {
    await this.channelWrapper.close();
    this.logger.log('RabbitMQ channel closed');
  }

  async sendAuthenticateResponse(response: any) {
    try {
      await this.channelWrapper.publish(
        process.env.AUTHEXCHANGENAME,
        process.env.AUTHKEYRES,
        Buffer.from(JSON.stringify({ response })),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error adding movie to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
