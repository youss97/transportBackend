import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DocumentType } from '../enums/document-type.enum';

@Schema({ timestamps: true, collection: 'documents' })
export class DocumentEntity extends Document {
  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true, enum: DocumentType })
  type: DocumentType;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  owner?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Vehicle' })
  vehicle?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Activity' })
  activity: Types.ObjectId;

  @Prop({ required: false, default: null })
  expirationDate?: Date;

  @Prop({ default: true })
  isValid: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  company?: Types.ObjectId; 
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentEntity);
