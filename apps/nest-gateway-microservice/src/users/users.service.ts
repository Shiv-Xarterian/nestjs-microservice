import { Inject, Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs'; // Import firstValueFrom

@Injectable()
export class UsersService {
  client: ClientProxy;
  // constructor(@Inject('AUTH_CLIENT') private authClient: ClientProxy) {}
  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: 8877,
      },
    });
  }

  async gethello(): Promise<any> {
    try {
      const res = await firstValueFrom(this.client.send({ cmd: 'auth' }, {}));
      return res; // Return the actual response from the microservice
    } catch (error) {
      console.error('Error calling auth microservice:', error);
      throw error; // Handle the error as needed
    }
  }
}
