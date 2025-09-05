
import { IsString, IsNumber, IsOptional, IsEnum, IsObject, IsNotEmpty, IsArray } from 'class-validator';

export class BatchDocumentsDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsArray()
    @IsNotEmpty()
    children: Array<any[]>;
}