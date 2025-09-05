import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DocumentStructure, DocumentDocument, ChildNode } from './schemas/document.schema';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/create-document.dto';
import { CreateChildNodeDto, UpdateChildNodeDto } from './dto/child-node.dto';
import { BatchDocumentsDto } from "./dto/batch-documents"
import {childWordCountDto} from "./dto/child-wordCount.dto"
import { ParentSortDto,ChildSortDto } from './dto/sort.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(DocumentStructure.name)
    private documentModel: Model<DocumentDocument>,
  ) { }

  async createDocument(createDocumentDto: CreateDocumentDto): Promise<DocumentStructure> {
    const createdDocument = new this.documentModel({
      ...createDocumentDto,
      children: [],
    });
    return createdDocument.save();
  }

  async findAllDocuments(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ documents: DocumentStructure[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;

    try {
      // 由于Mongoose查询条件存在问题，暂时使用手动过滤的方式
      // TODO: 后续需要调查Mongoose查询条件的问题
      const allDocuments = await this.documentModel
        .find({})
        .sort({ sort: 1, createdAt: -1 })
        .exec();

      const filteredDocs = allDocuments.filter(doc => doc.userId === userId);
      
      // 对每个文档的子节点按sort字段升序排序
      filteredDocs.forEach(doc => {
        if (doc.children && doc.children.length > 0) {
          doc.children.sort((a, b) => a.sort - b.sort);
        }
      });
      
      const total = filteredDocs.length;
      const paginatedDocs = filteredDocs.slice(skip, skip + limit);

      return {
        documents: paginatedDocs,
        total,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async findDocumentById(userId: string, documentId: string): Promise<DocumentStructure> {
    // 由于Mongoose查询条件存在问题，使用手动过滤的方式
    // TODO: 后续需要调查Mongoose查询条件的问题
    const allDocuments = await this.documentModel.find({}).exec();
    const document = allDocuments.find((doc: any) =>
      doc._id.toString() === documentId && doc.userId === userId
    );

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // 对子节点按sort字段升序排序
    if (document.children && document.children.length > 0) {
      document.children.sort((a, b) => a.sort - b.sort);
    }

    return document;
  }

  async updateDocument(
    updateDocumentDto: UpdateDocumentDto,
  ): Promise<DocumentStructure> {
    const { _id, userId, ...updateData } = updateDocumentDto;

    // 由于Mongoose查询条件存在问题，使用手动过滤的方式
    // TODO: 后续需要调查Mongoose查询条件的问题
    const allDocuments = await this.documentModel.find({}).exec();
    const document = allDocuments.find((doc: any) =>
      doc._id.toString() === _id && doc.userId === userId
    );

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // 更新文档字段
    Object.assign(document, updateData);
    await document.save();

    // 对子节点按sort字段升序排序
    if (document.children && document.children.length > 0) {
      document.children.sort((a, b) => a.sort - b.sort);
    }

    return document;
  }

  async deleteDocument(userId: string, documentId: string): Promise<void> {
    const result = await this.documentModel
      .deleteOne({ _id: documentId, userId })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Document not found');
    }
  }

  async addChildNode(createChildNodeDto: CreateChildNodeDto): Promise<ChildNode> {
    const { userId, parentId, ...childData } = createChildNodeDto;

    // 由于Mongoose查询条件存在问题，使用手动过滤的方式
    // TODO: 后续需要调查Mongoose查询条件的问题
    const allDocuments = await this.documentModel.find({}).exec();
    const document = allDocuments.find((doc: any) =>
      doc._id.toString() === parentId && doc.userId === userId
    );

    if (!document) {
      throw new NotFoundException('Parent document not found');
    }

    const newChild = {
      ...childData,
      _id: new Types.ObjectId(),
      parentId: new Types.ObjectId(parentId),
    };

    document.children.push(newChild as ChildNode);
    await document.save();

    return newChild as ChildNode;
  }

  /**
   * @description 修改子节点
   * @param childId 
   * @param updateChildNodeDto 
   * @returns 
   */
  async updateChildNode(childId: string, updateChildNodeDto: UpdateChildNodeDto): Promise<ChildNode> {
    const { parentId, ...updateData } = updateChildNodeDto;

    // 由于Mongoose查询条件存在问题，使用手动过滤的方式
    // TODO: 后续需要调查Mongoose查询条件的问题
    const allDocuments = await this.documentModel.find({}).exec();

    let document: any;
    let childIndex = -1;

    if (parentId) {
      // 如果提供了 parentId，直接查找对应的文档
      document = allDocuments.find((doc: any) =>
        doc._id.toString() === parentId
      );

      if (document) {
        childIndex = document.children.findIndex(
          (child) => (child as any)._id.toString() === childId,
        );
      }
    } else {
      // 如果没有提供 parentId，遍历所有文档查找包含该 childId 的文档
      for (const doc of allDocuments) {
        const index = doc.children.findIndex(
          (child) => (child as any)._id.toString() === childId,
        );
        if (index !== -1) {
          document = doc;
          childIndex = index;
          break;
        }
      }
    }

    if (!document) {
      throw new NotFoundException('Parent document not found');
    }

    if (childIndex === -1) {
      throw new NotFoundException('Child node not found');
    }

    // 保留原有的必要字段，避免覆盖丢失
    const originalChild = document.children[childIndex];
    const preservedFields: any = {
      _id: originalChild._id,
      parentId: originalChild.parentId,
      createdAt: originalChild.createdAt
    };

    // 只更新明确提供的字段，过滤掉 undefined 值
    const fieldsToUpdate: any = {};
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fieldsToUpdate[key] = updateData[key];
      }
    });

    // 应用更新数据，但保留必要的系统字段
    Object.assign(document.children[childIndex], fieldsToUpdate, preservedFields);

    // 更新 updatedAt 时间戳
    document.children[childIndex].updatedAt = new Date();

    await document.save();

    return document.children[childIndex];
  }

  async deleteChildNode(childId: string, userId?: string, documentId?: string,): Promise<void> {
    // 由于Mongoose查询条件存在问题，使用手动过滤的方式
    // TODO: 后续需要调查Mongoose查询条件的问题
    const allDocuments = await this.documentModel.find({}).exec();

    let document: any;
    let childIndex = -1;

    if (documentId && userId) {
      // 如果提供了 documentId 和 userId，直接查找对应的文档
      document = allDocuments.find((doc: any) =>
        doc._id.toString() === documentId && doc.userId === userId
      );

      if (document) {
        childIndex = document.children.findIndex(
          (child) => (child as any)._id.toString() === childId,
        );
      }
    } else {
      // 如果没有提供完整参数，遍历所有文档查找包含该 childId 的文档
      for (const doc of allDocuments) {
        const index = doc.children.findIndex(
          (child) => (child as any)._id.toString() === childId,
        );
        if (index !== -1) {
          document = doc;
          childIndex = index;
          break;
        }
      }
    }

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (childIndex === -1) {
      throw new NotFoundException('Child node not found');
    }

    document.children.splice(childIndex, 1);
    await document.save();
  }

  async getChildNode(userId: string, documentId: string, childId: string,): Promise<ChildNode> {
    // 由于Mongoose查询条件存在问题，使用手动过滤的方式
    // TODO: 后续需要调查Mongoose查询条件的问题
    const allDocuments = await this.documentModel.find({}).exec();
    const document = allDocuments.find((doc: any) =>
      doc._id.toString() === documentId && doc.userId === userId
    );

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const child = document.children.find(
      (child) => (child as any)._id.toString() === childId,
    );

    if (!child) {
      throw new NotFoundException('Child node not found');
    }

    return child;
  }

  async getChildNodeById(userId: string, childId: string): Promise<ChildNode | null> {
    // 查找用户的所有文档中包含指定 childId 的子节点
    const allDocuments = await this.documentModel.find({ userId }).exec();

    for (const document of allDocuments) {
      const child = document.children.find(
        (child) => (child as any)._id.toString() === childId,
      );

      if (child) {
        return child;
      }
    }

    return null;
  }

  /**
   * @description 获取最近7天更新的文档
   * @param userId 
   * @returns 
   */
  async getRecentlyDocuments(userId: string): Promise<any[]> {
    const icons = ['FileText','Brain','Sparkles','PenTool'];
    const iconColors = ['bg-orange-500','bg-green-500','bg-purple-500','bg-blue-500'];
    const statusColors = ["bg-green-100 text-green-600","bg-blue-100 text-blue-600","bg-yellow-100 text-yellow-600","bg-gray-100 text-gray-600"];

    // 随机选择函数
    const randomIcon = () => icons[Math.floor(Math.random() * icons.length)];
    const randomIconColor = () => iconColors[Math.floor(Math.random() * iconColors.length)];
    const randomStatusColor = () => statusColors[Math.floor(Math.random() * statusColors.length)];

    // 计算时间差的函数
    const getTimeAgo = (date: Date) => {
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return '1天前';
      if (diffDays < 7) return `${diffDays}天前`;
      if (diffDays < 14) return '1周前';
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
      return `${Math.floor(diffDays / 30)}月前`;
    };

    // 计算字数的函数
    const calculateWordCount = (document: any) => {
      let totalWords = 0;
      if (document.children && document.children.length > 0) {
        document.children.forEach(child => {
          if (child.wordCount) {
            totalWords += child.wordCount;
          }
        });
      }
      return totalWords;
    };

    // 获取最新编辑的子节点
    const getLatestChild = (document: any) => {
      if (!document.children || document.children.length === 0) {
        return null;
      }
      // 按更新时间排序，获取最新的子节点
      const sortedChildren = document.children.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      return sortedChildren[0];
    };

    // 生成状态文本
    const getStatus = () => {
      const statuses = ['最新的', '已更新', '进行中', '已完成'];
      return "最新的" //statuses[Math.floor(Math.random() * statuses.length)];
    };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const documents = await this.documentModel.find({ 
      userId, 
      updatedAt: { $gte: sevenDaysAgo } 
    }).sort({ updatedAt: -1 }).limit(10).exec();

    // 转换为期望的格式
    return documents.map(doc => {
      const latestChild = getLatestChild(doc);
      return {
        // @ts-ignore
        id: doc._id.toString(),
        title: doc.title,
        // @ts-ignore
        lastEdited: getTimeAgo(doc.updatedAt),
        wordCount: calculateWordCount(doc),
        icon: randomIcon(),
        iconColor: randomIconColor(),
        statusColor: randomStatusColor(),
        status: getStatus(),
        child: latestChild,
        description: latestChild ? latestChild.title : ''
      };
    });
  }

  /**
   * @description 创建文档 批量子节点
   * @param data 
   */
  async createBatchDoc(dto: BatchDocumentsDto): Promise<DocumentStructure> {
    const { userId, children, title } = dto;

    // 创建主文档
    const createdDocument = new this.documentModel({
      title,
      userId,
      sort: 0,
      children: []
    });

    // 保存主文档以获取 _id
    const savedDocument = await createdDocument.save();

    // 处理子节点数据并创建 ChildNode 实例
    const processedChildren = children.map((child: any, index: number) => {
      const childData = {
        title: child.title,
        type: child.type || '',
        sort: child.sort !== undefined ? child.sort : index,
        parentId: savedDocument._id,
        content: child.content || {},
        map_mark: child.map_mark || []
      };
      return childData;
    });

    // 批量添加子节点
    savedDocument.children = processedChildren as any;

    // 保存包含子节点的文档
    const finalDocument = await savedDocument.save();

    // 对子节点按sort字段升序排序
    if (finalDocument.children && finalDocument.children.length > 0) {
      finalDocument.children.sort((a, b) => a.sort - b.sort);
    }

    return finalDocument;
  }

  /**
   * @description 更新子节点的字数
   * @param dto 
   */
  async updateWordCount(dto: childWordCountDto): Promise<ChildNode> {
    const { userId, documentId, childId, wordCount } = dto;

    // 查找指定的文档
    const document = await this.documentModel.findOne({
      _id: documentId,
      userId: userId
    }).exec();

    if (!document) {
      throw new NotFoundException('未找到指定的文档');
    }

    // 查找指定的子节点
    const childIndex = document.children.findIndex(
      (child) => (child as any)._id.toString() === childId
    );

    if (childIndex === -1) {
      throw new NotFoundException('未找到指定的文档');
    }

    // 更新子节点的字数
    document.children[childIndex].wordCount = wordCount;
    // @ts-ignore
    document.children[childIndex].updatedAt = new Date();

    // 保存文档
    await document.save();

    return document.children[childIndex];
  }


  /**
   * @description 父节点排序
   * @param dto 排序 dto 数组
   */
  async parentSort (dto: ParentSortDto[]): Promise<DocumentStructure[]> {
    const results: DocumentStructure[] = [];

    for (const item of dto) {
      const document = await this.documentModel.findOne({
        _id: item.id,
        userId: item.userId
      });

      if (!document) {
        throw new NotFoundException(`文档 ${item.id} 不存在`);
      }

      document.sort = item.sort;
      await document.save();
      results.push(document);
    }

    return results;
  }

  /**
   * @description 子节点排序
   * @param dto 排序 dto 数组
   */
  async childSort (dto:ChildSortDto[] ): Promise<ChildNode[]> {
    const results: ChildNode[] = [];
    
   
    
    for (const item of dto) {
      const document = await this.documentModel.findOne({  _id: item.Parentid,   userId: item.userId  });

      if (!document) {
        throw new NotFoundException(`父文档 ${item.Parentid} 不存在`);
      }

  

      const childIndex = document.children.findIndex(
        // @ts-ignore
        child => child._id.toString() === item.id
      );

      if (childIndex === -1) {
        throw new NotFoundException(`子节点 ${item.id} 不存在`);
      }

      
    
      // 转换为数字
      document.children[childIndex].sort = item.sort;
     console.log(`---------------- 子节点排序 ----------------`);
    console.log(item);
    console.log(`---------------- --------- ----------------`);

      await document.save();
      results.push(document.children[childIndex]);
    }

    return results;
  }

  
}