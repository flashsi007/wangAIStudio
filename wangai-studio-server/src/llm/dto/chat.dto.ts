import { IsNotEmpty, IsString,IsBoolean,IsOptional} from 'class-validator';

export class ChatDto {
 @IsString()
  @IsNotEmpty()
  userId: string;

   @IsString()
  @IsNotEmpty()
  model: string;


  @IsString()
  @IsNotEmpty()
  message: string;


  
}


export class UserChatDto {

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  message: string;

   @IsString()
  @IsNotEmpty()
  api: string;
}
