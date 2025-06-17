// src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from 'src/enums/user-role.enum';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop()
  birthDate: Date;

  @Prop()
  profilePhoto: string;

  @Prop()
  idDocument: string;

  @Prop({ default: true })
  isActive: boolean;

  // Spécifique aux chauffeurs
  @Prop()
  drivingLicense: string;

  @Prop([String])
  safetyDiplomas: string[];

  @Prop({ default: 0 })
  performanceScore: number;
}

export const UserSchema = SchemaFactory.createForClass(User);