import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class UserTarget extends Document {

  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ required: true, comment: '开始日期' })
  startDate: string;

  @Prop({ required: true, comment: '目标日期' })
  endDate: string;

  @Prop({ required: true, comment: '目标字数' })
  targetWords: string;

  @Prop({ default: '0', comment: '累计字数' })
  cumulativeWords: string;

  @Prop({ default: '0', comment: '今日字数' })
  todayWords: string;

  // 状态
  @Prop({ default: '0', comment: '状态' })
  status: string;

}

export const UserTargetSchema = SchemaFactory.createForClass(UserTarget);

@Schema({ timestamps: true })
export class DocumentWordsLog extends Document { 
  @Prop({ required: true, comment: '文档ID' })
  documentId: string;

  @Prop({ required: true, comment: '用户ID' })
  userId: string; 

  @Prop({ required: true, comment: '文档名称' })
  documentName: string;

  @Prop({ required: true, comment: '字数' })
  words: number;
}

export const DocumentWordsLogSchema = SchemaFactory.createForClass(DocumentWordsLog);

@Schema({ timestamps: true })
export class WordsLog extends Document  {
  @Prop({ required: true, comment: '用户ID' })
  userId: string;

  @Prop({ required: true, comment: '日期' })
  date: string; 

  @Prop({ required: true, comment: '字数' })
  words: number; 

  @Prop({ type: [DocumentWordsLogSchema], default: [] })
  children: DocumentWordsLog[];
}

export const WordsLogSchema = SchemaFactory.createForClass(WordsLog);


