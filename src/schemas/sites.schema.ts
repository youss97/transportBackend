import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SiteDocument = Site & Document;

@Schema({ timestamps: true })
export class Site {
  @Prop({ required: true })
  nom_site: string;

  @Prop({ required: true })
  adresse_depart: string;

  @Prop({ required: true })
  adresse_arrivee: string;

  @Prop({ required: true })
  temp_trajet: string;

  @Prop({ required: true })
  nom_resp_mine: string;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  company: Types.ObjectId;

  @Prop({ required: true })
  telephone_resp_mine: string;

  @Prop({ required: true })
  mail_resp_mine: string;

  @Prop({ required: true })
  prix_tonne: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  superviseur: Types.ObjectId;
}

export const SiteSchema = SchemaFactory.createForClass(Site);
