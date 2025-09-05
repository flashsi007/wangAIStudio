import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Novel,
  NovelNode,
  NovelInfo
} from './schemas/novel.schema';

import {
  getByIdNovelDto,
  CreateCharacterDto,
  DeleteCharacterDto,
  UpdateCharacterDto,
  GetCharacterKeywordDto,
  UpdateStatsDto,
  updataMinimapDto,
  DeletedNovelDto,
  RenameNovelDto
} from './dto/novel.dto';

import CreateNovelDto from './dto/create-novel.dto';

@Injectable()
export class novelService {
  constructor(
    @InjectModel(Novel.name)
    private readonly novelModel: Model<Novel>,
    @InjectModel(NovelNode.name)
    private readonly novelNodeModel: Model<NovelNode>,
  ) { }


  /**
   * @description 创建小说
   * @param dto 
   * @returns 
   */
  async createNovel(dto: CreateNovelDto) {
    const { userId, novel, nodes } = dto;

    try {
      // 1. 先创建小说基本信息，获取 novelId
      const createdNovel = await this.novelModel.create({
        userId,
        novel: {
          title: novel.title
        },
        nodes: [] // 初始为空数组
      });

      const novelId = createdNovel._id;
      console.log('Created novel with ID:', novelId);

      // 2. 创建非 chapter 类型的节点
      const createdNodes: any[] = [];
      const outlineNodeMap = new Map(); // 存储 outline 节点的映射

      for (const node of nodes) {
        if (node.type !== 'outline') {
          // 创建 mindmap 类型的节点
          const novelNode = await this.novelNodeModel.create({
            novelId: novelId.toString(),
            userId,
            parentId: novelId.toString(), // 顶级节点
            type: node.type,
            title: node.title,
            content: node.content,
            stats: {
              wordCount: 0,
              paragraphs: 0
            },
            children: [],
            order: createdNodes.length
          });
          createdNodes.push(novelNode);
        } else {
          // 创建 outline 类型的节点
          const outlineNode = await this.novelNodeModel.create({
            novelId: novelId.toString(),
            userId,
            parentId: novelId.toString(), // 顶级节点
            type: node.type,
            title: node.title,
            content: null,
            stats: {
              wordCount: 0,
              paragraphs: 0
            },
            children: [],
            order: createdNodes.length
          });
          createdNodes.push(outlineNode);
          outlineNodeMap.set(node, outlineNode._id);
        }
      }

      // 3. 创建 chapter 类型节点作为 outline 的子节点
      for (const node of nodes) {
        if (node.type === 'outline' && node.children && node.children.length > 0) {
          const outlineNodeId = outlineNodeMap.get(node);

          for (let i = 0; i < node.children.length; i++) {
            const chapter = node.children[i];
            const chapterNode = await this.novelNodeModel.create({
              novelId: novelId.toString(),
              userId,
              parentId: outlineNodeId, // 设置父节点为 outline 节点的 _id
              type: chapter.type,
              title: chapter.title,
              content: chapter.content,
              stats: {
                wordCount: 0,
                paragraphs: 0
              },
              children: [],
              order: i
            });
            createdNodes.push(chapterNode);
          }
        }
      }

      console.log('Created nodes:', createdNodes.length);

      return {
        success: true,
        novelId: novelId.toString(),
        message: '小说创建成功',
        data: {
          novel: createdNovel,
          nodesCount: createdNodes.length
        }
      };
    } catch (error) {
      console.error('Error creating novel:', error);
      throw error;
    }
  }

  /**
   * @description 获取用户的小说列表
   * @param userId 
   * @returns 
   */
  async getNovelList(userId: string) {
    const novels = await this.novelModel.find({ userId }).lean();
    return novels;
  }

  /**
   * 删除小说
   * @param userId 
   * @param novelId 
   */
  // @ts-ignore
  async deleteNovel(dto: DeletedNovelDto) {
    const { userId, novelId } = dto;
    const result = await this.novelModel.deleteOne({ _id: novelId, userId }).exec();
    await this.novelNodeModel.deleteMany({ novelId, userId }).exec();
    return result
  }

  // 小说重命名
  async novelRename(dto: RenameNovelDto) {
    const { userId, novelId, title } = dto;
    console.log('novelRename input:', dto);

    try {
      // 首先检查文档是否存在
      const existingNovel = await this.novelModel.findOne({ _id: novelId, userId }).exec();
      if (!existingNovel) {
        console.log('Novel not found:', { novelId, userId });
        throw new NotFoundException('小说不存在或无权限访问');
      }

      if (existingNovel.novel === null) {
        // 创建小说信息
        const novel = { title: title.trim() };
        return await this.novelModel.updateOne(
          { _id: novelId, userId },
          { $set: { novel } }
        ).exec();


      }
      // 执行更新
      const result = await this.novelModel.updateOne(
        { _id: novelId, userId },
        { $set: { 'novel.title': title.trim() } }
      ).exec();

      // 验证更新结果
      if (result.matchedCount === 0) {
        throw new NotFoundException('未找到匹配的小说文档');
      }

      if (result.modifiedCount === 0) {
        console.log('No documents were modified - title might be the same');
      }

      // 返回更新后的文档以确认更改
      const updatedNovel: any = await this.novelModel.findOne({ _id: novelId, userId }).exec();

      return {
        ...result,
        updatedTitle: updatedNovel.novel?.title
      };
    } catch (error) {
      console.error('Error in novelRename:', error);
      throw error;
    }
  }


  /**
   * 根据小说ID获取小说信息及其层级节点结构
   * 层级结构：novel(根) -> outline/mindmap(二级) -> chapter(三级)
   * @param dto 包含userId和小说id的查询参数
   * @returns 小说信息和三层级的节点树形结构
   */
  async getByIdNovelInfo(dto: getByIdNovelDto) {
    const { userId, id } = dto;

    // 步骤1: 查询小说基本信息（根节点）
    // 由于_id字段在数据库中是字符串类型，但Mongoose可能会进行类型转换
    // 我们先用userId查询，然后在结果中筛选匹配的_id
    const novels = await this.novelModel.find({ userId: userId }).lean();
    const novel = novels.find(n => n._id.toString() === id);

    if (!novel) {
      return null;
    }

    // 步骤2: 查询大纲和思维导图节点（二级节点） 
    const nodes = await this.novelNodeModel.find({
      type: { $in: ['outline', 'mindmap'] },
      parentId: id
    }).sort({ createdAt: -1 }).lean()


    const nodeIds = nodes.map(item => item._id)

    // 步骤3: 查询章节节点（三级节点）
    const chapterNodes = await this.novelNodeModel.find({
      parentId: { $in: nodeIds },
      type: 'chapter',
    })
      .sort({ createdAt: -1 })
      .select('-content').lean();


    let tmp: any = []

    // 步骤4: 整理节点树形结构
    nodes.filter(item => item.type === 'outline').forEach(node => {
      const childNodes = chapterNodes.filter(item => item.parentId === node._id)
      node.children = childNodes
      // console.log(node);
      tmp.push(node)
    })


    let mindmapNodes = nodes.filter(item => item.type === 'mindmap')

    let list = tmp.concat(mindmapNodes)


    // 步骤7: 返回结果
    return {
      novel: novel,
      nodes: list,
    };
  }


  /**
    * 根据节点ID获取章节内容信息
    * @param id 节点ID
    * @returns 节点信息
    */
  async getCharacterInfo(dto: getByIdNovelDto) {

    try {
      const { userId, id } = dto;
      const character = await this.novelNodeModel.aggregate([
        { $match: { userId } },
        { $addFields: { idStr: { $toString: "$_id" } } },
        { $match: { idStr: id } }
      ]).exec();
      return character && character[0] || null;
    } catch (error) {
      console.log(error)
      throw new NotFoundException('节点不存在')
    }
  }





  /**
   * 创建章节
   * @param dto 
   */
  async createCharacter(dto: CreateCharacterDto) {
    const { userId, novelId } = dto;

    // 查看 novel  是否存在
    const novels = await this.novelModel.aggregate([
      { $match: { userId } },
      { $addFields: { idStr: { $toString: "$_id" } } },
      { $match: { idStr: novelId } }
    ]).exec();


    if (!novels || novels.length === 0) return null;
    return await this.novelNodeModel.create(dto)

  }


  /**
   * @description 删除章节
   * @param dto 
   */
  // @ts-ignore
  async deleteCharacterById(dto: DeleteCharacterDto) {
    const { userId, id, novelId } = dto;
    // 验证章节是否存在且未被删除

    const character = await this.novelNodeModel.findOne({ _id: id, userId }).exec();

    if (!character) {
      throw new NotFoundException('章节不存在或已被删除');
    }


    if (character.type === 'outline') {
      //  若是大纲节点，则删除其下所有章节 
      await this.novelNodeModel.deleteMany({ parentId: id, userId, novelId, type: 'chapter' }).exec();
    }

    //  章节删除
    const result = await this.novelNodeModel.deleteOne({ _id: id, novelId, userId }).exec();

    return result

  }



  /**
   * @description 更新章节信息
   * @param dto 
   * @returns 
   */
  async updateCharacter(dto: UpdateCharacterDto) {
    const { userId, id } = dto;
    const character = await this.novelNodeModel.findOne({ _id: id, userId }).exec();

    if (!character) {
      return null;
    }
    return await this.novelNodeModel.updateOne({ _id: id, userId }, { $set: dto }).exec();
  }


  /**
   * @description 根据关键字搜索小说章节
   * @param keyword 
   * @param dto 
   */
  async getCharacterKeyword(dto: GetCharacterKeywordDto) {
    const { novelId, userId, keyword } = dto;
    // 构建正则：全局、忽略大小写
    const regex = new RegExp(keyword, 'i');

    const characters = await this.novelNodeModel.find({
      userId,
      novelId,
      type: 'chapter',
      $or: [
        // { title: regex },
        { 'content.html': regex }
      ]
    }).sort({ createdAt: -1 })
      // .select('-content')
      .lean();

    return characters;
  }

  /**
   * 更新文章字数统计
   */
  async updateStats(dto: UpdateStatsDto) {
    const { id, userId, novelId, wordCount, paragraphs } = dto;

    // 查找并更新节点的字数统计
    const updatedNode = await this.novelNodeModel.findOneAndUpdate(
      { _id: id, userId, novelId },
      {
        $set: {
          'stats.wordCount': wordCount,
          'stats.paragraphs': paragraphs
        }
      },
      { new: true }
    );

    if (!updatedNode) {
      throw new NotFoundException('节点不存在或无权限访问');
    }

    return updatedNode;
  }


  async updataMinimap(dto: updataMinimapDto) {
    const { id, userId, novelId, content, title } = dto;
    const character = await this.novelNodeModel.findOne({ _id: id, userId }).exec();

    if (!character) {
      return null;
    }

    if (character.type !== 'mindmap') return null;

    let params = {
      content: content
    }

    if (title) {
      params['title'] = title
    }

    return await this.novelNodeModel.updateOne({ _id: id, userId }, { $set: params }).exec();
  }

  /**
   * 导出全部章节内容 - 返回文件内容供浏览器下载
   * @param novelId  
   */
  async getAllCharacter(userId: string, novelId: string, type: string) {
    const characters = await this.novelNodeModel.find({
      userId: userId,
      novelId: novelId,
      type: type
    }).sort({ createdAt: -1 }).exec();

    return characters

  }



}


