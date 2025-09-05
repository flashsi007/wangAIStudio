
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
export class childWordCountDto {
     @IsString()
     @IsNotEmpty()
     userId: string;

     @IsString()
     @IsNotEmpty()
     documentId: string;

     @IsString()
     @IsNotEmpty()
     childId: string;
    
     @IsNumber()
     @IsNotEmpty()
     wordCount: number; 

}
 