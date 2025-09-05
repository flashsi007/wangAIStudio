import {
    Controller,
    Get,
    Post,
    Body,
    Query,
} from '@nestjs/common';

import { CreatePrompterDto, UpdatePrompterDto, PrompterListDto, PrompterDeleteDto } from './dto/prompter.dto';

import { PrompterService } from './prompter.service';

@Controller('prompter')
export class PrompterController {
    constructor(private readonly prompterService: PrompterService) { }

    @Post("/createPrompter")
    async createPrompter(@Body() createPrompterDto: CreatePrompterDto) {
        let result = await this.prompterService.createPrompter(createPrompterDto);
        return {
            status: 'success',
            data: result,
        }
    }

    @Post("/updatePrompter")
    async updatePrompter(@Body() updatePrompterDto: UpdatePrompterDto) {
        let result = await this.prompterService.updatePrompter(updatePrompterDto);
        if (result) {
            return {
                status: 'success',
                data: result,
            }
        } else {
            return {
                status: 'error',
                message: 'Prompter not found',
            }
        }
    }

    @Post("/deletePrompter")
    async deletePrompter(@Body() deletePrompterDto: PrompterDeleteDto) {
        let result = await this.prompterService.deletePrompter(deletePrompterDto);
        if (result) {
            return {
                status: 'success',
                data: result,
            }
        } else {
            return {
                status: 'error',
                message: 'Prompter not found',
            }
        }
    }

    @Get("/getPrompterList")
    async getPrompterList(@Query() prompterListDto: PrompterListDto) {
        let result = await this.prompterService.getPrompterList(prompterListDto);
        return {
            status: 'success',
            data: result,
        }
    }
}