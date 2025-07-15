import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type AssignmentDocument = Assignment & Document;

@Schema({ timestamps: true })
export class Assignment {
  @ApiProperty({ description: 'ID du chauffeur', type: String })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  driver?: Types.ObjectId;

  @ApiProperty({ description: 'ID du superviseur', type: String, required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  supervisor?: Types.ObjectId;

  @ApiProperty({ description: 'ID du site', type: String })
  @Prop({ type: Types.ObjectId, ref: 'Site', required: true })
  site: Types.ObjectId;

  @ApiProperty({ description: 'ID de la société', type: String })
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  company: Types.ObjectId;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
