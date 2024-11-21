import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Conexão com PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost', // ou o nome do serviço no Docker Compose
      port: 5432,
      username: 'seu_usuario',
      password: 'sua_senha',
      database: 'virtual_currency_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Não recomendado em produção
    }),
    // Conexão com MongoDB
    MongooseModule.forRoot('mongodb://localhost:27017/virtual_currency_logs'),
    UsersModule,
  ],
})
export class AppModule {}

