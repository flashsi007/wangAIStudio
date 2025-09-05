import { IsString, IsNumber, IsOptional, IsEnum, IsObject, IsNotEmpty, IsArray } from 'class-validator';
import { DocType } from '../schemas/document.schema';

export class CreateChildNodeDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  parentId: string;

  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsEnum(['markdown', 'mindmap'])
  type: DocType;

  @IsNumber()
  @IsOptional()
  sort?: number;

  @IsOptional()
  content?: any;

  @IsArray()
  @IsOptional()
  map_mark?: Array<any>;
}

export class UpdateChildNodeDto {
  @IsString()
  @IsOptional()
  nodeId?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(['markdown', 'mindmap'])
  @IsOptional()
  type?: DocType;

  @IsNumber()
  @IsOptional()
  sort?: number;

  @IsOptional()
  content?: any;

  @IsArray()
  @IsOptional()
  map_mark?: Array<any>;

  @IsString()
  @IsOptional()
  _id?: string;

  @IsString()
  @IsOptional()
  userId?: string;
}