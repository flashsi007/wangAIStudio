import { IsString, IsNumber,   IsNotEmpty,  } from 'class-validator'; 
/**
 * 排序 dto
 * @description 排序 dto
 * @param id 文档 id
 * @param sort 排序
 */
export class ParentSortDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @IsNotEmpty()
  sort: number;
}


/**
 * 子节点排序 dto
 * @description 子节点排序 dto
 * @param userId 用户 id
 * @param Parentid 父节点 id
 * @param id 子节点 id
 * @param sort 排序

 */
export class  ChildSortDto {
 @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  Parentid: string;

  @IsString()
  @IsNotEmpty()
  id: string;

   @IsNumber()
  @IsNotEmpty()
  sort: number;
}

