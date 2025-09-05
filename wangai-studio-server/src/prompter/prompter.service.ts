import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Prompter, PrompterSchema } from './schemas/prompter.schema';

import { CreatePrompterDto, UpdatePrompterDto, PrompterListDto, PrompterDeleteDto } from './dto/prompter.dto';

@Injectable()
export class PrompterService {
    constructor(
        @InjectModel(Prompter.name) private readonly prompterModel: Model<Prompter>,
    ) { }

    /**
     * @description 创建 prompter
     * @param dot 
     * @returns 
     */
    async createPrompter(dot: CreatePrompterDto): Promise<Prompter> {
        const createdPrompter = new this.prompterModel(dot);
        return await createdPrompter.save();
    }

    /**
     * @description 更新 prompter
     * @param dto 
     * @returns 
     */
    async updatePrompter(dto: UpdatePrompterDto): Promise<Prompter | null> {
        const { id } = dto
        let param = { ...dto }
        // @ts-ignore
        delete param.id


        const prompter = await this.prompterModel.findByIdAndUpdate(id, dto, { new: true })
        if (!prompter) return null

        return prompter

    }


    /**
     * @description 删除 prompter
     * @param dto 
     * @returns 
     */
    async deletePrompter(dto: PrompterDeleteDto): Promise<Prompter | null> {
        const { id } = dto
        const prompter = await this.prompterModel.findByIdAndDelete(id)
        if (!prompter) return null

        return prompter
    }

    /**
     * @description 获取 prompter 列表
     * @param dto 
     * @returns 
     */
    async getPrompterList(dto: PrompterListDto): Promise<Prompter[] | null> {
        const { userId, id, title, page, pageSize } = dto
        let query = {}
        if (id) query = { ...query, _id: id }
        if (title) query = { ...query, title: { $regex: title, $options: 'i' } }
        query = { ...query, userId: userId }
        const prompters = await this.prompterModel.find(query).skip((parseInt(page) - 1) * parseInt(pageSize)).limit(parseInt(pageSize))
        if (!prompters) return null

        return prompters
    }
}