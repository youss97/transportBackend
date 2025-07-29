import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type AssignmentDocument = Assignment & Document;

@Schema({ timestamps: true })
export class Assignment {
  @ApiProperty({ description: 'Liste des chauffeurs', type: [String] })
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  drivers: Types.ObjectId[];

  @ApiProperty({ description: 'Liste des superviseurs', type: [String] })
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  supervisors: Types.ObjectId[];

  @ApiProperty({ description: 'ID du site', type: String })
  @Prop({ type: Types.ObjectId, ref: 'Site', required: false })
  site: Types.ObjectId;

  @ApiProperty({ description: 'ID de la société', type: String })
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  company: Types.ObjectId;
}


export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
