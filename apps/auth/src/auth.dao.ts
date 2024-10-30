import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Auth } from './schemas/auth.schema';
import { Model } from 'mongoose';
import { LoginRequestDto, RegisterRequestDto } from './auth.schema';

@Injectable()
export class AuthDao {
  constructor(@InjectModel(Auth.name) private authModel: Model<Auth>) {}
  async registerDao(user: RegisterRequestDto) {
    const res = await this.authModel.create(user);
    return res;
  }

  async loginDao(user: LoginRequestDto) {
    const res = await this.authModel.findOne({ email: user.email });
    return res;
  }
}
