import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Transaction, TransactionType } from './transaction.entity';
import { User } from '../users/user.entity';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './audit-log.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectModel(AuditLog.name)
    private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async createTransaction(
    userId: number,
    tipo: TransactionType,
    valor: number,
  ): Promise<Transaction> {
    // Initialize queryRunner
    const queryRunner =
      this.transactionRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Fetch user within the transaction
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      if (tipo === TransactionType.DEBIT && Number(user.saldo) < valor) {
        throw new BadRequestException('Saldo insuficiente');
      }

      const saldoAnterior = user.saldo;

      if (tipo === TransactionType.CREDIT) {
        user.saldo = Number(user.saldo) + valor; // Convertendo para número
      } else {
        user.saldo = Number(user.saldo) - valor; // Convertendo para número
      }

      await queryRunner.manager.save(user);

      const transaction = new Transaction();
      transaction.tipo = tipo;
      transaction.valor = valor;
      transaction.user = user;

      await queryRunner.manager.save(transaction);

      // Commit the transaction
      await queryRunner.commitTransaction();

      // Handle audit logging outside of the main transaction
      try {
        const auditLog = new this.auditLogModel({
          transactionId: transaction.id,
          userId: user.id,
          tipo,
          valor,
          saldoAnterior,
          saldoAtual: user.saldo,
        });
        await auditLog.save();
      } catch (error) {
        // Log the error but don't affect the main transaction
        console.error('Failed to save audit log:', error);
      }

      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransactionsByUser(
    userId: number,
    page?: number,
    limit?: number,
  ): Promise<Transaction[]> {
    const queryOptions: any = {
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    };

    if (page !== undefined && limit !== undefined) {
      queryOptions.skip = (page - 1) * limit;
      queryOptions.take = limit;
    }

    return this.transactionRepository.find(queryOptions);
  }
}
