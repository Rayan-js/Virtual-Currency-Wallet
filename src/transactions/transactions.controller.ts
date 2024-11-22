import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionType } from './transaction.entity';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post(':userId/credit')
  credit(
    @Param('userId') userId: number,
    @Body('valor') valor: number,
  ) {
    return this.transactionsService.createTransaction(userId, TransactionType.CREDIT, valor);
  }

  @Post(':userId/debit')
  debit(
    @Param('userId') userId: number,
    @Body('valor') valor: number,
  ) {
    return this.transactionsService.createTransaction(userId, TransactionType.DEBIT, valor);
  }

  @Get(':userId')
  getTransactions(@Param('userId') userId: number) {
    return this.transactionsService.getTransactionsByUser(userId);
  }
}
