import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserTarget, WordsLog } from './schemas/userTarget.schema';
import { WordsLogDto } from './dto/userTarget.dto';

import { RedisService } from '../llm/redis.service';



function expireSeconds() { // 过期时间 今天的23点59分59秒
  let now = new Date();
  let tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
}


function ttl(): number { // 设置 每周日晚上 00:00:00 过期
  const now = new Date();
  const nextSunday = new Date(now);

  // 0 = 周日，1 = 周一，…… 6 = 周六
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7; // 如果今天是周日，则取 7（下周日）
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(0, 0, 0, 0); // 设置为 00:00:00.000

  const diffMs = nextSunday.getTime() - now.getTime();
  return Math.floor(diffMs / 1000);
}


/**
 * 获取指定时间戳所在周的周日 00:00:00 的时间戳（毫秒）
 */
function getThisSundayMidnight(ts: number): number {
  const d = new Date(ts);
  const day = d.getDay();       // 0 周日 1 周一 … 6 周六
  const offset = day === 0 ? 0 : -day; // 退回到所在周的周日
  d.setDate(d.getDate() + offset);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * 判断 ts 是否落在第 nWeek 周（1..7）
 * nWeek = 1 表示"本周"
 */
function isNthWeek(ts: number, nWeek: number): boolean {
  const now = Date.now();
  const currentSunday = getThisSundayMidnight(now);
  const targetWeekStart = currentSunday + (nWeek - 1) * 7 * 24 * 3600 * 1000;
  const targetWeekEnd = targetWeekStart + 7 * 24 * 3600 * 1000;
  return ts >= targetWeekStart && ts < targetWeekEnd;
}


// 获取今天日期（格式：2022-12-2）
function dateFormat() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = today.getMonth() + 1;
  const dd = today.getDate();
  // 去掉前导 0
  return `${yyyy}-${mm}-${dd}`;
}

@Injectable()
export class UserTargetService {
  constructor(
    @InjectModel(UserTarget.name) private userTargetModel: Model<UserTarget>,
    @InjectModel(WordsLog.name) private wordsLogModel: Model<WordsLog>,
    private readonly redisService: RedisService
  ) { }



  // 设置字数 
  async setWords(userId: string, todayWords: number, characterId: string): Promise<{ todayWords: number }> {
    /* ====== 1. key 名保持原样 ====== */
    const redisKey = `${userId}_words_log`;
    const wordsLogWeekKey = `${userId}_words_log_week`;
    const todayWordsKey = `${userId}_words_log_today`;

    /* ====== 2. 读旧数据 ====== */
    let str = await this.redisService.get(redisKey) || '';
    let cache: any = {};
    try {
      cache = str ? JSON.parse(str) : {};
    } catch {
      cache = {};
    }

    /* ====== 3. 初始化/补齐字段 ====== */
    cache.snap = cache.snap || {};        // 每篇文章最近一次总字数
    cache.todaySum = cache.todaySum || 0;     // 今天累计新增
    cache.weekSum = cache.weekSum || 0;     // 本周累计新增

    /* ====== 4. 计算增量（跨文章） ====== */
    const prevTotal = cache.snap[characterId] || 0;
    const delta = Math.max(0, todayWords - prevTotal); // 删除不计

    /* ====== 5. 累加 ====== */
    cache.todaySum += delta;
    cache.weekSum += delta;

    /* ====== 6. 更新文章快照 ====== */
    cache.snap[characterId] = todayWords;

    /* ====== 7. 兼容旧字段（让其余 key 保持原样） ====== */
    const totalForOld = cache.todaySum;   // 让 todayWordsKey / wordsLogWeekKey 用同一个值
    cache.words = totalForOld;
    cache.characterId = characterId;      // 纯粹占位，无实际意义

    /* ====== 8. 写回三个 key（调用方式 100% 不变） ====== */
    await this.redisService.set(redisKey, JSON.stringify(cache), expireSeconds());
    await this.redisService.set(todayWordsKey, JSON.stringify({ words: totalForOld }), expireSeconds());

    const now = Date.now();

    // 读取现有的周统计数据
    let weekStr = await this.redisService.get(wordsLogWeekKey) || '';
    let weeklyData = {
      oneWeekWords: 0,
      twoWeekWords: 0,
      threeWeekWords: 0,
      fourWeekWords: 0,
      fiveWeekWords: 0,
      sixWeekWords: 0,
      sevenWeekWords: 0,
    };

    try {
      if (weekStr) {
        const existingData = JSON.parse(weekStr);
        weeklyData = { ...weeklyData, ...existingData };
      }
    } catch {
      // 解析失败时使用默认值
    }

    // 根据星期几直接映射到对应的字段
    const currentDate = new Date(now);
    const dayOfWeek = currentDate.getDay(); // 0=周日, 1=周一, 2=周二, ..., 6=周六

    // 调试日志：输出关键时间信息
    // console.log('=== 周统计调试信息 ===');
    // console.log('当前时间:', currentDate.toLocaleString());
    // console.log('星期几:', dayOfWeek, '(0=周日, 1=周一, 2=周二, 3=周三, 4=周四, 5=周五, 6=周六)');
    // console.log('增量delta:', delta);

    // 字段映射关系：
    // oneWeekWords: 星期一
    // twoWeekWords: 星期二
    // threeWeekWords: 星期三
    // fourWeekWords: 星期四
    // fiveWeekWords: 星期五
    // sixWeekWords: 星期六
    // sevenWeekWords: 星期天(周日)
    const dayNames = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

    // console.log(`今天是${dayNames[dayOfWeek]}`);
    // console.log('现有周数据:', weeklyData);

    // 根据星期几将增量累加到对应的字段
    switch (dayOfWeek) {
      case 0: // 周日 -> sevenWeekWords
        const oldSevenValue = weeklyData.sevenWeekWords;
        weeklyData.sevenWeekWords += delta;
        console.log(`更新sevenWeekWords(星期天): ${oldSevenValue} + ${delta} = ${weeklyData.sevenWeekWords}`);
        break;
      case 1: // 周一 -> oneWeekWords
        const oldOneValue = weeklyData.oneWeekWords;
        weeklyData.oneWeekWords += delta;
        console.log(`更新oneWeekWords(星期一): ${oldOneValue} + ${delta} = ${weeklyData.oneWeekWords}`);
        break;
      case 2: // 周二 -> twoWeekWords
        const oldTwoValue = weeklyData.twoWeekWords;
        weeklyData.twoWeekWords += delta;
        console.log(`更新twoWeekWords(星期二): ${oldTwoValue} + ${delta} = ${weeklyData.twoWeekWords}`);
        break;
      case 3: // 周三 -> threeWeekWords
        const oldThreeValue = weeklyData.threeWeekWords;
        weeklyData.threeWeekWords += delta;
        console.log(`更新threeWeekWords(星期三): ${oldThreeValue} + ${delta} = ${weeklyData.threeWeekWords}`);
        break;
      case 4: // 周四 -> fourWeekWords
        const oldFourValue = weeklyData.fourWeekWords;
        weeklyData.fourWeekWords += delta;
        console.log(`更新fourWeekWords(星期四): ${oldFourValue} + ${delta} = ${weeklyData.fourWeekWords}`);
        break;
      case 5: // 周五 -> fiveWeekWords
        const oldFiveValue = weeklyData.fiveWeekWords;
        weeklyData.fiveWeekWords += delta;
        console.log(`更新fiveWeekWords(星期五): ${oldFiveValue} + ${delta} = ${weeklyData.fiveWeekWords}`);
        break;
      case 6: // 周六 -> sixWeekWords
        const oldSixValue = weeklyData.sixWeekWords;
        weeklyData.sixWeekWords += delta;
        console.log(`更新sixWeekWords(星期六): ${oldSixValue} + ${delta} = ${weeklyData.sixWeekWords}`);
        break;
      default:
        console.log('未知的星期几:', dayOfWeek);
        break;
    }

    // console.log('更新后周数据:', weeklyData);
    // console.log('=== 调试信息结束 ===');

    await this.redisService.set(
      wordsLogWeekKey,
      JSON.stringify({
        characterId,
        ...weeklyData,
      }),
      ttl()
    );

    /* ====== 9. 返回值保持原样 ====== */
    return { todayWords: totalForOld };
  }



  /*******************************  获取历史字数 ***********************************************/
  // 获取今天的字数
  async getTodayWords(userId: string) {
    let todayWordsKey = `${userId}_words_log_today`
    let str = await this.redisService.get(todayWordsKey) || ""

    if (str) {
      let cache = JSON.parse(str)
      return { ...cache }
    } else {
      return { words: 0 }
    }


  }

  // 获取一周字数
  async getOneWeekWords(userId: string) {
    let redisKey = `${userId}_words_log_week`
    let str = await this.redisService.get(redisKey) || ""
    if (str) {
      return JSON.parse(str)
    } else {
      return 0
    }
  }




  // 记录用户写入的字数  : Promise<WordsLog>
  async recordWordsLog(dto: WordsLogDto) {



  }







}