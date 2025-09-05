import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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


@Schema({ timestamps: true })
export class Prompter extends Document {
    @Prop({ type: String, default: () => uuid() })
    declare _id: string; // 添加 declare 修饰符


    @Prop({ type: String, required: true, comment: '用户ID' })
    userId: string;

    @Prop({ type: String, required: true })
    content: String;

    @Prop({ type: String, required: true })
    title: string;

}

export const PrompterSchema = SchemaFactory.createForClass(Prompter);