import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from 'src/enums/user-role.enum';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  company: Types.ObjectId;

  @Prop()
  phone: string;
  @Prop()
  birthDate: string;
  @Prop()
  address: string;

  @Prop()
  licenseNumber: string;

  @Prop()
  licenseExpirationDate: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLogin: Date;

  // Nouveau champ pour la photo de l'utilisateur
  @Prop({ default: null })
  photo: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
