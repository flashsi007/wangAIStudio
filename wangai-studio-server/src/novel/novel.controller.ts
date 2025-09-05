import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Query,
    Param,
    HttpCode,
    HttpStatus,
    BadRequestException,
    Res,
} from '@nestjs/common';
import { Response } from 'express';
import { novelService } from './novel.service'
import CreateNovelDto from './dto/create-novel.dto';
import {
    getByIdNovelDto,
    CreateCharacterDto,
    DeleteCharacterDto,
    UpdateCharacterDto,
    GetCharacterKeywordDto,
    DeletedNovelDto,
    RenameNovelDto
} from './dto/novel.dto';

@Controller('novel')
export class NovelController {
    constructor(private readonly service: novelService) { }

    @Post('/createNovel')
    async createNovel(@Body() body: CreateNovelDto) {
        const result = await this.service.createNovel(body)
        return {
            status: 'success',
            data: result,
        }
    }

    @Post('/info')
    async getByIdNovelInfo(@Body() body: getByIdNovelDto) {
        const novelInfo = await this.service.getByIdNovelInfo(body)
        return {
            status: 'success',
            data: novelInfo,
        };
    }

    @Post('/deleteNovel')
    async deleteNovel(@Body() body: DeletedNovelDto): Promise<{ status: string; data: any }> { // 删除小说
        const result = await this.service.deleteNovel(body)
        return {
            status: 'success',
            data: result,
        };
    }
    @Post('/novelRename')
    async novelRename(@Body() body: RenameNovelDto) { // 修改小说名称

        const result = await this.service.novelRename(body)
        return {
            status: 'success',
            data: result,
        };
    }

    @Post('/chapter')
    async getCharacterInfo(@Body() body: getByIdNovelDto) {
        const chapterInfo = await this.service.getCharacterInfo(body)
        return {
            status: 'success',
            data: chapterInfo,
        };
    }

    @Post('/createCharacter')
    async createCharacter(@Body() body: CreateCharacterDto) {
        const result = await this.service.createCharacter(body)
        return {
            status: 'success',
            data: result,
        };
    }

    @Post('/deleteCharacterById')
    async deleteCharacterById(
        @Body() body: DeleteCharacterDto
    ): Promise<{ status: string; data: any }> {
        const result = await this.service.deleteCharacterById(body)
        return {
            status: 'success',
            data: result,
        };
    }

    @Post('/updateCharacter')
    async updateCharacter(@Body() body: UpdateCharacterDto) {
        const result = await this.service.updateCharacter(body)
        return {
            status: 'success',
            data: result,
        };
    }

    @Post('/getCharacterKeyword')
    async getCharacterKeyword(@Body() body: GetCharacterKeywordDto) {
        const result = await this.service.getCharacterKeyword(body)
        return {
            status: 'success',
            data: result,
        };
    }

    @Get('/getNovelList')
    async getNovelList(@Query('userId') userId: string) {
        const result = await this.service.getNovelList(userId)
        return {
            status: 'success',
            data: result,
        };
    }

    @Get('/getAllCharacter/:userInd/:novelId/:type')
    async getAllCharacter(
        @Param('userInd') userInd: string,
        @Param('novelId') novelId: string,
        @Param('type') type: string
    ) {
        const result = await this.service.getAllCharacter(userInd, novelId, type);

        return {
            status: 'success',
            data: result,
        }

    }



}
