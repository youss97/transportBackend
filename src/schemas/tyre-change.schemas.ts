// src/tyre-change/schemas/tyre-change.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class TyreChange extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  driverId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
  vehicleId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  dateChange: Date;

  @Prop({ type: Number, required: true })
  kilometrage: number;

  @Prop({
    type: [String],
    enum: ['avant_gauche', 'avant_droit', 'arriere_gauche', 'arriere_droit'],
    required: true
  })
  positions: string[];

  @Prop({ type: String })
  note?: string;
}

export const TyreChangeSchema = SchemaFactory.createForClass(TyreChange);
