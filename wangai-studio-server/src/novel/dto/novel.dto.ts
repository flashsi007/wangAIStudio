import { IsString, IsNumber, IsOptional, IsEnum, IsObject, IsNotEmpty, IsArray } from 'class-validator';
import { DocType } from '../schemas/novel.schema'





export class getByIdNovelDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    id: string;

}

export class DeletedNovelDto {
    @IsString()
    @IsNotEmpty()
    novelId: string; // 小说id

    @IsString()
    @IsNotEmpty()
    userId: string; // 用户id
}


export class RenameNovelDto {
    @IsString()
    @IsNotEmpty()
    novelId: string; // 小说id

    @IsString()
    @IsNotEmpty()
    userId: string; // 用户id

    @IsString()
    @IsNotEmpty()
    title: string; // 小说标题
}



export class CreateCharacterDto {



    @IsString()
    @IsNotEmpty()
    novelId: string; // 小说id

    @IsString()
    @IsNotEmpty()
    userId: string; // 用户id

    @IsString()
    @IsNotEmpty()
    title: string; // 章节标题

    @IsString()
    @IsNotEmpty()
    type: DocType; // 类型  

    @IsString()
    @IsNotEmpty()
    parentId: string; // 父章节id 


    @IsString()
    @IsOptional()
    description?: string; // 剧情描述 可选

    @IsOptional()
    content?: any;// 内容 可选
}

export class UpdateCharacterDto {

    @IsString()
    @IsNotEmpty()
    id: string; // characterid

    @IsString()
    @IsNotEmpty()
    userId: string; // 用户id

    @IsString()
    @IsNotEmpty()
    novelId: string; // 小说id

    @IsString()
    @IsOptional()
    type?: DocType; // 类型

    @IsString()
    @IsOptional()
    title?: string; // 章节标题

    @IsString()
    @IsOptional()
    description?: string; // 剧情描述 可选

    @IsOptional()
    content?: any;// 内容 可选
}

export class DeleteCharacterDto {
    @IsString()
    @IsNotEmpty()
    userId: string; // 用户id

    @IsString()
    @IsNotEmpty()
    id: string; // 用户id


    @IsString()
    @IsNotEmpty()
    novelId: string; // 小说id
}

export class GetCharacterKeywordDto {

    @IsString()
    @IsNotEmpty()
    userId: string;// userId


    @IsString()
    @IsNotEmpty()
    novelId: string; // 小说id

    @IsString()
    @IsNotEmpty()
    keyword: string; // 关键字
}

export class UpdateStatsDto {

    @IsString()
    @IsNotEmpty()
    id: string; // 用户id

    @IsString()
    @IsNotEmpty()
    userId: string; // 用户id

    @IsString()
    @IsNotEmpty()
    novelId: string; // 小说id

    @IsNumber()
    @IsNotEmpty()
    wordCount: number; // 字数

    @IsNumber()
    @IsNotEmpty()
    paragraphs: number; // 总段数
}

export class updataMinimapDto {

    @IsString()
    @IsNotEmpty()
    id: string; // 用户id

    @IsString()
    @IsNotEmpty()
    userId: string; // 用户id

    @IsString()
    @IsNotEmpty()
    novelId: string; // 小说id

    @IsString()
    @IsOptional()
    title?: string; // 小说标题

    @IsNotEmpty()
    content: any; // 思维导图内容

}
