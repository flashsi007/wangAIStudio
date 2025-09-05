import { Module, forwardRef } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { UserTargetService } from "../userTarget/userTarget.service"
import { MongooseModule } from '@nestjs/mongoose';

import { NodeSchema, Node, Novel, NovelSchema } from '../novel/schemas/novel.schema'
import { LlmModule } from '../llm/llm.module';
import { NovelModule } from '../novel/novel.module';

import { UserTarget, UserTargetSchema, WordsLog, WordsLogSchema } from '../userTarget/schemas/userTarget.schema';

@Module({
  imports: [
    forwardRef(() => LlmModule),
    forwardRef(() => NovelModule),
    MongooseModule.forFeature([
      { name: Node.name, schema: NodeSchema },
      { name: Novel.name, schema: NovelSchema },
      { name: WordsLog.name, schema: WordsLogSchema },
      { name: UserTarget.name, schema: UserTargetSchema },
    ]),
  ],

  providers: [
    SocketGateway,
    SocketService,
    UserTargetService
  ],
  exports: [
    SocketService,
  ],
})
export class SocketModule {

}