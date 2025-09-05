import { IsString, IsNumber, IsOptional, IsEnum, IsObject, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';



/* 思维导图顶层对象 */
export class CreatePrompterDto {

    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

}

export class UpdatePrompterDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    content?: string;
}


export class PrompterListDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsOptional()
    id?: string;

    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsNotEmpty()
    page: string;

    @IsString()
    @IsNotEmpty()
    pageSize: string;
}

export class PrompterDeleteDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    id: string;
}