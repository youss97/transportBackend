
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Document } from 'mongoose';
import { CreateUserDto } from './create-user.dto';

@Schema({ timestamps: true })
export class CompanySettings extends Document {
  @Prop({ required: true })
  companyId: string;

  @Prop({ required: true })
  workStartHour: string;

  @Prop({ required: true })
  workEndHour: string;

  @Prop()
  totalBreakHours?: number;


}

export const CompanySettingsSchema = SchemaFactory.createForClass(CompanySettings);
