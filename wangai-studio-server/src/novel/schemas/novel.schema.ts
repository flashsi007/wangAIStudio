import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DocType = 'outline' | 'mindmap' | 'chapter';


/**
    * 生成UUID v4格式的唯一标识符
    * @returns {string} 返回格式为 xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx 的UUID字符串
    */
export function uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;           // 生成0-15的随机数
        const v = c === 'x' ? r : (r & 0x3) | 0x8;    // x位置用随机数，y位置用特定格式
        return v.toString(16);                        // 转换为16进制字符
    });
}

// 统计信息子文档
@Schema({ _id: false })
export class Stats {
    @Prop({ type: Number, default: 0 })
    wordCount: number;

    @Prop({ type: Number, default: 0 })
    paragraphs: number;
}

export const StatsSchema = SchemaFactory.createForClass(Stats);

// 子节点（章节）
@Schema({ timestamps: true })
export class ChildNode extends Document {
    @Prop({ type: String, default: () => uuid() })
    declare _id: string; // 添加 declare 修饰符

    @Prop({ required: true })
    type: DocType;

    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ type: Object })
    content: any;

    @Prop({ type: StatsSchema })
    stats: Stats;
}

export const ChildNodeSchema = SchemaFactory.createForClass(ChildNode);

// 主节点
@Schema({ timestamps: true })
export class Node extends Document {
    @Prop({ type: String, default: () => uuid() })
    declare _id: string; // 添加 declare 修饰符

    @Prop({ required: true })
    type: DocType;

    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ type: Object })
    content: any;

    @Prop({ type: [ChildNodeSchema] })
    children: ChildNode[];
}

export const NodeSchema = SchemaFactory.createForClass(Node);

// 小说基本信息
@Schema({ _id: false })
export class NovelInfo {
    @Prop({ required: true })
    title: string;
}

export const NovelInfoSchema = SchemaFactory.createForClass(NovelInfo);

// 小说主文档
@Schema({ timestamps: true })
export class Novel extends Document {

    @Prop({ type: String, default: () => uuid() })
    declare _id: string; // 添加 declare 修饰符


    @Prop({ type: NovelInfoSchema, required: true })
    novel: NovelInfo;

    @Prop({ type: [NodeSchema], default: [] })
    nodes: Node[];

    @Prop({ type: String, required: true })
    userId: string;
}

export const NovelSchema = SchemaFactory.createForClass(Novel);

// 独立的小说节点文档（对应novel_nodes集合）
@Schema({ collection: 'novel_nodes', timestamps: true })
export class NovelNode extends Document {

    @Prop({ type: String, default: () => uuid() })
    declare _id: string; // 添加 declare 修饰符

    @Prop({ type: String, required: true })
    novelId: string;

    @Prop({ type: String, required: true })
    userId: string;

    @Prop({ type: String, default: null })
    parentId?: string;

    @Prop({ required: true })
    type: DocType;

    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ type: Object })
    content: any;

    @Prop({ type: StatsSchema })
    stats: Stats;

    @Prop({ type: Array, default: [] })
    children: any[];

    @Prop({ type: Number, default: 0 })
    order: number;
}

export const NovelNodeSchema = SchemaFactory.createForClass(NovelNode);



