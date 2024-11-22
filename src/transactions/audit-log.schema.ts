import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema()
export class AuditLog {
  @Prop()
  transactionId: number;

  @Prop()
  userId: number;

  @Prop()
  tipo: string;

  @Prop()
  valor: number;

  @Prop()
  saldoAnterior: number;

  @Prop()
  saldoAtual: number;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
