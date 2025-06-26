import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DocumentType } from '../enums/document-type.enum';
import { DocumentStatus } from 'src/enums/document-status.enum';

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
  vehicleId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Activity' })
  activity: Types.ObjectId;

  @Prop({ required: false, default: null })
  expirationDate?: Date;

  @Prop({ default: true })
  isValid: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Company'})
  company?: Types.ObjectId; 
    @Prop({ required: true, enum: DocumentStatus, default: DocumentStatus.PENDING }) // New status field
  status: DocumentStatus
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentEntity);
