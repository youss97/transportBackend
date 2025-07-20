import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Gazoil extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  driverId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ required: true })
  montantPhoto: string;

  @Prop({ required: true })
  kilometragePhoto: string;

  @Prop()
  comment?: string;
}

export const GazoilSchema = SchemaFactory.createForClass(Gazoil);
