import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AuthDao } from './auth.dao';
import { LoginRequestDto, RegisterRequestDto } from './auth.schema';
import { JwtService } from '@nestjs/jwt';
import { RabbitMQService } from './rabbitmq/auth.rabbitmq';

@Injectable()
export class AuthService {
  constructor(
    private readonly authDao: AuthDao,
    private readonly jwt: JwtService,
    @Inject(forwardRef(() => RabbitMQService))
    private readonly rabbitmq: RabbitMQService,
  ) {}

  async registerUser(user: RegisterRequestDto, uuid: string) {
    const res = await this.authDao.registerDao(user);
    const payload = { id: res._id };
    const token = this.jwt.sign(payload, {
      secret: process.env.SECRETKEY,
    });
    this.rabbitmq.sendAuthenticateResponse({
      user: res,
      auth_token: token,
      uuid: uuid,
    });
  }

  async loginUser(user: LoginRequestDto, uuid: string) {
    const res = await this.authDao.loginDao(user);
    const payload = { id: res._id };
    const token = this.jwt.sign(payload, {
      secret: process.env.SECRETKEY,
    });
    this.rabbitmq.sendAuthenticateResponse({
      user: res,
      auth_token: token,
      uuid: uuid,
    });
  }
}
