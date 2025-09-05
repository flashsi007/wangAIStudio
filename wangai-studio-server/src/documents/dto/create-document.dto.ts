import { IsString, IsNumber, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { DocType } from '../schemas/document.schema';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(['markdown', 'mindmap'])
  @IsOptional()
  type?: DocType;

  @IsNumber()
  @IsOptional()
  sort?: number;
}

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  userId: string;

  @IsString()
  _id: string;

  @IsNumber()
  @IsOptional()
  sort?: number;
}