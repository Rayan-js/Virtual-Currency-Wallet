import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  ParseIntPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionType } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post(':userId/credit')
  credit(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsService.createTransaction(
      userId,
      TransactionType.CREDIT,
      createTransactionDto.valor,
    );
  }

  @Post(':userId/debit')
  debit(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsService.createTransaction(
      userId,
      TransactionType.DEBIT,
      createTransactionDto.valor,
    );
  }

  @Get(':userId')
  getTransactions(@Param('userId', ParseIntPipe) userId: number) {
    return this.transactionsService.getTransactionsByUser(userId);
  }
}
