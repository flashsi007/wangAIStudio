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
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/create-document.dto';
import { CreateChildNodeDto, UpdateChildNodeDto } from './dto/child-node.dto';
import { BatchDocumentsDto } from "./dto/batch-documents"
import {childWordCountDto} from "./dto/child-wordCount.dto"
import { ParentSortDto, ChildSortDto } from './dto/sort.dto'; 

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) { }

  @Post()
  async createDocument(@Body() createDocumentDto: CreateDocumentDto) {
    const document = await this.documentsService.createDocument(createDocumentDto);
    return {
      status: 'success',
      data: document,
    };
  }

  
   /**
   * @description 获取最近7天更新的文档
   * @param userId 
   * @returns 
   */ 
  @Get('recently/:userId')
  async getRecentlyDocuments(@Param('userId') userId: string){
    if(!userId){
      throw new BadRequestException('userId 是必填项');
    }
    const documents = await this.documentsService.getRecentlyDocuments(userId);
    return {
      status: 'success',
      data: documents,
    }
  }

  @Get()
  async getDocuments(
    @Query('userId') userId?: string,
    @Query('documentId') documentId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // 如果提供了documentId，返回单个文档详情
    if (documentId && userId) {
      const document = await this.documentsService.findDocumentById(userId, documentId);
      return {
        status: 'success',
        data: document,
      };
    }

    // 否则返回文档列表
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const result = await this.documentsService.findAllDocuments(userId, pageNum, limitNum);

    return {
      status: 'success',
      data: result.documents,
      pagination: {
        total: result.total,
        page: pageNum,
        pages: result.pages,
        limit: limitNum,
      },
    };
  }

  @Put()
  async updateDocument(@Body() updateDocumentDto: UpdateDocumentDto) {
    const document = await this.documentsService.updateDocument(updateDocumentDto);
    return {
      status: 'success',
      data: document,
    };
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDocument(
    @Query('userId') userId: string,
    @Query('documentId') documentId: string,
  ) {
    await this.documentsService.deleteDocument(userId, documentId);
  }

  @Post('children')
  async addChildNode(@Body() createChildNodeDto: CreateChildNodeDto) {
    const childNode = await this.documentsService.addChildNode(createChildNodeDto);
    return { status: 'success', data: childNode };
  }

  @Post('batch')
  async createBatchDoc(@Body() dto: BatchDocumentsDto) {

    const document = await this.documentsService.createBatchDoc(dto);
    return {
      status: 'success',
      data: document,
    }
  }

  /**
   * @description 父节点批量排序
   */
  @Put('parent-sort')
  async parentSort(@Body() dto: ParentSortDto[]) {
    const documents = await this.documentsService.parentSort(dto);
    return {
      status: 'success',
      data: documents,
    };
  }

}

@Controller('children')
export class ChildrenController {
  constructor(private readonly documentsService: DocumentsService) { }

  @Put(':childId')
  async updateChildNode(
    @Param('childId') childId: string,
    @Body() updateChildNodeDto: UpdateChildNodeDto,
  ) {
    const childNode = await this.documentsService.updateChildNode(childId, updateChildNodeDto);
    return {
      status: 'success',
      data: childNode,
    };
  }

  @Delete(':childId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteChildNode(
    @Param('childId') childId: string,
    @Query('userId') userId?: string,
    @Query('documentId') documentId?: string,
  ) {
    await this.documentsService.deleteChildNode(childId, userId, documentId);
  }

  @Get(':childId')
  async getChildNodeById(@Param('childId') childId: string, @Query('userId') userId: string,) {
    const childNode = await this.documentsService.getChildNodeById(userId, childId);
    return {
      status: 'success',
      data: childNode,
    };
  }

  @Get()
  async getChildNode(
    @Query('userId') userId: string,
    @Query('documentId') documentId: string,
    @Query('childId') childId: string,
  ) {
    const childNode = await this.documentsService.getChildNode(userId, documentId, childId);
    return {
      status: 'success',
      data: childNode,
    };
  }


  @Post('wordCount')
  async updateWordCount(@Body() dto: childWordCountDto) {
    const childNode = await this.documentsService.updateWordCount(dto);
    return {
      status: 'success',
      data: childNode,
    };
  }

  /**
   * @description 子节点批量排序
   */
  @Post('child-sort')
  async childSort(@Body() dto: ChildSortDto[] ) { 
    const childNodes = await this.documentsService.childSort(dto);
    return {
      status: 'success',
      data: childNodes,
    };
  }

}