import { Body, Controller, Get, Post, Put, Req, Res } from '@nestjs/common';
import { RegisterRequestDto } from './auth.dto';
import { Request, Response } from 'express';
import { RabbitMQService } from './rabbitmq/auth.rabbitmq';
import { LoginRequestDto } from 'apps/auth/src/auth.schema';

@Controller('users')
export class AuthController {
  constructor(private readonly rabbitMQ: RabbitMQService) {}

  @Post()
  async registerRequest(
    @Body() User: RegisterRequestDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const response = await this.rabbitMQ.sendToken({
        body: User,
        key: 'register',
      });
      return res.send(response);
    } catch (error) {
      return res
        .status(error.StatusCode || 500)
        .json({ error: error.error || 'INTERNAL_SERVER_ERROR' });
    }
  }

  @Put()
  async loginRequest(
    @Body() User: LoginRequestDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const response = await this.rabbitMQ.sendToken({
        body: User,
        key: 'login',
      });
      return res.send(response);
    } catch (error) {
      return res
        .status(error.StatusCode || 500)
        .json({ error: error.error || 'INTERNAL_SERVER_ERROR' });
    }
  }
}
