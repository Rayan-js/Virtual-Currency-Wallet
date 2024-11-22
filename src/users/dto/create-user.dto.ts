import { IsNotEmpty, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  nome: string;

  @IsEmail()
  email: string;
}
