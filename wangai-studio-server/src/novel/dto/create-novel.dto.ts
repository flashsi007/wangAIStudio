import { IsString, IsNumber, IsOptional, IsEnum, IsObject, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { DocType } from '../schemas/novel.schema'


import { Type } from 'class-transformer';

/* -------------------------------------------------------------------------- */
/*                               三层嵌套结构                                */
/* -------------------------------------------------------------------------- */

/* 思维导图单个节点 */
class MindMapNode {
    @IsObject()
    data: {
        text: string;
    };

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MindMapNode)
    children?: MindMapNode[];
}

/* 思维导图顶层对象 */
class MindMap {
    @IsString()
    title: string;

    @IsString()
    type: 'mindmap';

    @IsObject()
    @ValidateNested()
    @Type(() => MindMapNode)
    content: {
        data: { text: string };
        children?: MindMapNode[];
    };
}

/* 章节（outline 下的子项） */
class Chapter {
    @IsString()
    title: string;

    @IsString()
    type: 'chapter';

    @IsObject()
    content: {
        html: string;
    };
}

/* 大纲（outline 顶层对象） */
class Outline {
    @IsString()
    title: string;

    @IsString()
    type: 'outline';

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Chapter)
    children: Chapter[];
}

/* -------------------------------------------------------------------------- */
/*                                  小说信息                                  */
/* -------------------------------------------------------------------------- */

class Novel {
    @IsString()
    @IsNotEmpty()
    title: string;
}

/* -------------------------------------------------------------------------- */
/*                                  根 DTO                                   */
/* -------------------------------------------------------------------------- */

export default class CreateNovelDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsObject()
    @ValidateNested()
    @Type(() => Novel)
    novel: Novel;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Object, {
        /* MindMap 与 Outline 是联合类型，需要运行时判别 */
        discriminator: {
            property: 'type',
            subTypes: [
                { value: MindMap, name: 'mindmap' },
                { value: Outline, name: 'outline' },
            ],
        },
        keepDiscriminatorProperty: true,
    })
    nodes: (MindMap | Outline)[];
}