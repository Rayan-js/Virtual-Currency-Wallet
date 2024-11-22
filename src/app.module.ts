import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    UsersModule,
    TransactionsModule,
    ConfigModule.forRoot({
      isGlobal: true, // Torna as variáveis de ambiente acessíveis em todo o projeto
    }),
    // Conexão com PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: true,
    }),

    // Conexão com MongoDB
    MongooseModule.forRoot(process.env.MONGODB_URI),
  ],
  controllers: [AppController], // Adiciona o AppController
  providers: [AppService], // Adiciona o AppService
})
export class AppModule {}
