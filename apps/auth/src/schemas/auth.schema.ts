import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsMongoId, IsString } from 'class-validator';

@Schema()
export class Auth {
  @IsMongoId()
  _id: string;
  @Prop()
  @IsString()
  name: string;
  @Prop()
  @IsString()
  email: string;
  @Prop()
  @IsString()
  password: string;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
AuthSchema.index({ email: 1 });
