import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    // Hash the password
    user.password = await bcrypt.hash(user.password, 10);
    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError.code === '23505'
      ) {
        // '23505' is the PostgreSQL error code for unique violations
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find(); // Retorna todos os usuários
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(
    id: number,
    updateUserDto: Partial<CreateUserDto>,
  ): Promise<User> {
    const user = await this.findOne(id); // Confirma que o usuário existe
    Object.assign(user, updateUserDto); // Atualiza os campos
    return this.usersRepository.save(user); // Salva as alterações no banco
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id); // Confirma que o usuário existe
    await this.usersRepository.remove(user); // Remove o usuário
  }
}
