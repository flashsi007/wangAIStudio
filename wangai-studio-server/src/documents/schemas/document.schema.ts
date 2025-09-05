import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DocType = 'markdown' | 'mindmap';

@Schema({ timestamps: true })
export class ChildNode extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: String, enum: ['markdown', 'mindmap'] })
  type: DocType;

  @Prop({ default: 0 })
  sort: number;

  @Prop({ type: Types.ObjectId, required: true })
  parentId: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  content: any;

  @Prop()
  nodeId?: string;

  @Prop({ type: Array, default: [] })
  map_mark: Array<any>;

 @Prop({ default: 0 })
  wordCount: number;

}

export const ChildNodeSchema = SchemaFactory.createForClass(ChildNode);

@Schema({ timestamps: true, collection: 'documentstructures' })
export class DocumentStructure extends Document {
  @Prop({ required: true })
  title: string;
 
  @Prop({ default: 0 })
  sort: number;

  @Prop({ required: true })
  userId: string;

  @Prop({ type: [ChildNodeSchema], default: [] })
  children: ChildNode[];
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentStructure);
export type DocumentDocument = DocumentStructure & Document;