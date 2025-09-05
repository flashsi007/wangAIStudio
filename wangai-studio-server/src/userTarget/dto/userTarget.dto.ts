
import { IsNotEmpty, IsString,IsNumber, IsObject } from 'class-validator';

export class UserTargetDto {
    @IsString()
    @IsNotEmpty({ message: 'UserId不能为空' })
    userId: string;

    @IsString()
    @IsNotEmpty({ message: 'startDate 不能为空' })
    startDate: string;

    @IsString()
    @IsNotEmpty({ message: 'endDate 不能为空' })
    endDate: string;

    @IsString()
    @IsNotEmpty({ message: 'targetWords 不能为空' })
    targetWords: string; 
}   

class IChildWordsLog {
 
 @IsString()
 @IsNotEmpty({ message: 'documentId 不能为空' })
 documentId: string;
 
 @IsString()
 @IsNotEmpty({ message: 'userId 不能为空' })
  userId: string; 

 @IsString()
 @IsNotEmpty({ message: 'documentName 不能为空' })
  documentName: string; 

  @IsNumber()
  @IsNotEmpty({ message: 'words 不能为空' })
  words: number; 
}

export class WordsLogDto {

  @IsString()
  @IsNotEmpty({ message: 'UserId不能为空' })
  userId: string;
  
  @IsObject()
  @IsNotEmpty({ message: 'document 不能为空' })
  document: IChildWordsLog;
}