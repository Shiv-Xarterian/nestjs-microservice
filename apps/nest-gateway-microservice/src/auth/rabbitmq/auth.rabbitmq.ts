import {
  Injectable,
  OnModuleInit,
  Logger,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import amqp, { Channel, ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private channelWrapper: ChannelWrapper;
  private readonly logger = new Logger(RabbitMQService.name);
  private pendingRequests = new Map<string, (response: any) => void>();

  constructor() {
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
      await channel.consume('Authenticate_Queue_Response', async (payload) => {
        if (payload) {
          const response = JSON.parse(payload.content.toString());
          const { uuid } = response.response;
          if (this.pendingRequests.has(uuid)) {
            const resolve = this.pendingRequests.get(uuid);
            resolve(response);
            this.pendingRequests.delete(uuid);
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

  async sendToken(data: any): Promise<any> {
    const uuid = uuidv4();
    data.uuid = uuid;

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(uuid, resolve);
      try {
        this.channelWrapper.publish(
          process.env.AUTHEXCHANGENAME,
          process.env.AUTHKEYREQ,
          Buffer.from(JSON.stringify(data)),
        );
      } catch (error) {
        this.pendingRequests.delete(uuid); // Clean up on error
        reject(
          new HttpException(
            error.message || 'Error sending token to queue',
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        );
      }
    });
  }
}
