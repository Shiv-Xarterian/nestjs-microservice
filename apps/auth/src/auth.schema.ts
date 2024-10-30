import { IsString, Length } from 'class-validator';

export class RegisterRequestDto {
  @IsString()
  name: string;
  @IsString()
  email: string;
  @IsString()
  @Length(5, 10)
  password: string;
}

export class LoginRequestDto {
  @IsString()
  email: string;
  @IsString()
  @Length(5, 10)
  password: string;
}
