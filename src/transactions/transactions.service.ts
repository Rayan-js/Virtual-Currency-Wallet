import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  async createTransaction(userId: number, tipo: TransactionType, valor: number): Promise<Transaction> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (tipo === TransactionType.DEBIT && user.saldo < valor) {
      throw new BadRequestException('Saldo insuficiente');
    }

    // Iniciar transação do TypeORM
    const queryRunner = this.transactionRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const saldoAnterior = user.saldo;

      if (tipo === TransactionType.CREDIT) {
        user.saldo += valor;
      } else {
        user.saldo -= valor;
      }

      await queryRunner.manager.save(user);

      const transaction = new Transaction();
      transaction.tipo = tipo;
      transaction.valor = valor;
      transaction.user = user;

      await queryRunner.manager.save(transaction);

      // Salvar log no MongoDB
      const auditLog = new this.auditLogModel({
        transactionId: transaction.id,
        userId: user.id,
        tipo,
        valor,
        saldoAnterior,
        saldoAtual: user.saldo,
      });
      await auditLog.save();

      await queryRunner.commitTransaction();

      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }
}
