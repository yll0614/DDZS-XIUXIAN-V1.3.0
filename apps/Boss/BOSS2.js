import { plugin, verc, data, config } from '../../api/api.js';
import fs from 'fs';
import {
  Add_灵石,
  ForwardMsg,
  Add_HP,
  Harm,
  zd_battle,
  channel,
} from '../../model/xiuxian.js';
let WorldBOSSBattleCD = []; //CD
let WorldBOSSBattleLock = 0; //BOSS战斗锁，防止打架频率过高造成奖励多发
let WorldBOSSBattleUnLockTimer = 0; //防止战斗锁因意外锁死
export class BOSS2 extends plugin {
  constructor() {
    super({
      name: 'Yunzai_Bot_修仙_BOSS',
      dsc: 'BOSS模块',
      event: 'message',
      priority: 600,
      rule: [
        {
          reg: '^#开启金角大王$',
          fnc: 'CreateWorldBoss',
        },
        {
          reg: '^#关闭金角大王$',
          fnc: 'DeleteWorldBoss',
        },
        {
          reg: '^#金角大王状态$',
          fnc: 'LookUpWorldBossStatus',
        },
        {
          reg: '^#金角大王贡献榜$',
          fnc: 'ShowDamageList',
        },
        {
          reg: '^#讨伐金角大王$',
          fnc: 'WorldBossBattle',
        },
      ],
    });
    this.set = config.getConfig('task', 'task');
    this.task = {
      cron: this.set.BossTask2,
      name: 'BossTask2',
      fnc: () => this.CreateWorldBoss(),
    };
  }

  //金角大王开启指令
  async CreateWorldBoss(e) {
    if (!e || e.isMaster) {
      await InitWorldBoss(e);
      return false;
    }
  }
  //金角大王结束指令
  async DeleteWorldBoss(e) {
    if (!verc({ e })) return false;
    if (e.isMaster) {
      if (await BossIsAlive()) {
        await redis.del('Xiuxian:WorldBossStatus2');
        await redis.del('xiuxian@1.3.0Record2');
        e.reply('金角大王挑战关闭！');
      } else e.reply('金角大王未开启');
    } else return false;
  }
  //金角大王状态指令
  async LookUpWorldBossStatus(e) {
    if (!verc({ e })) return false;
    if (await BossIsAlive()) {
      let WorldBossStatusStr = await redis.get('Xiuxian:WorldBossStatus2');
      if (WorldBossStatusStr) {
        WorldBossStatusStr = JSON.parse(WorldBossStatusStr);
        if (new Date().getTime() - WorldBossStatusStr.KilledTime < 86400000) {
          e.reply(`金角大王正在刷新,20点开启`);
          return false;
        } else if (WorldBossStatusStr.KilledTime != -1) {
          if ((await InitWorldBoss(e)) == 0) await this.LookUpWorldBossStatus(e);
          return false;
        }
        let ReplyMsg = [
          `----金角大王状态----\n攻击:????????????\n防御:????????????\n血量:${WorldBossStatusStr.Health}\n奖励:${WorldBossStatusStr.Reward}`,
        ];
        e.reply(ReplyMsg);
      }
    } else e.reply('金角大王未开启！');
    return false;
  }

  //金角大王伤害贡献榜
  async ShowDamageList(e) {
    if (!verc({ e })) return false;
    if (await BossIsAlive()) {
      let PlayerRecord = await redis.get('xiuxian@1.3.0Record2');
      let WorldBossStatusStr = await redis.get('Xiuxian:WorldBossStatus2');
      WorldBossStatusStr = JSON.parse(WorldBossStatusStr);
      PlayerRecord = JSON.parse(PlayerRecord);
      let PlayerList = await SortPlayer(PlayerRecord);
      if (!PlayerRecord?.Name) {
        e.reply('还没人挑战过金角大王');
        return false;
      }
      let CurrentQQ;
      let TotalDamage = 0;
      for (
        let i = 0;
        i < (PlayerList.length <= 20 ? PlayerList.length : 20);
        i++
      )
        TotalDamage += PlayerRecord.TotalDamage[PlayerList[i]];
      let msg = ['****金角大王周本贡献排行榜****'];
      for (var i = 0; i < PlayerList.length; i++) {
        if (i < 20) {
          let Reward = Math.trunc(
            (PlayerRecord.TotalDamage[PlayerList[i]] / TotalDamage) *
              WorldBossStatusStr.Reward
          );
          Reward = Reward < 200000 ? 200000 : Reward;
          msg.push(
            '第' +
              `${i + 1}` +
              '名:\n' +
              `名号:${PlayerRecord.Name[PlayerList[i]]}` +
              '\n' +
              `总伤害:${PlayerRecord.TotalDamage[PlayerList[i]]}` +
              `\n${
                WorldBossStatusStr.Health == 0 ? `已得到灵石` : `预计得到灵石`
              }:${Reward}`
          );
        }
        let user_qq=e.user_id.toString().replace("qg_","")
        user_qq=await channel(user_qq)
        if (PlayerRecord.QQ[PlayerList[i]] == user_qq) CurrentQQ = i + 1;
      }
      await ForwardMsg(e, msg);
      await sleep(1000);
      if (CurrentQQ)
        e.reply(
          `你在金角大王周本贡献排行榜中排名第${CurrentQQ}，造成伤害${
            PlayerRecord.TotalDamage[PlayerList[CurrentQQ - 1]]
          }，再接再厉！`
        );
    } else e.reply('金角大王未开启！');
    return false;
  }
  //与金角大王战斗
  async WorldBossBattle(e) {
    if (!verc({ e })) return false;
    if (e.isPrivate) return false;

    if (!(await BossIsAlive())) {
      e.reply('金角大王未开启！');
      return false;
    }
    let usr_qq=e.user_id.toString().replace("qg_","")
    usr_qq=await channel(usr_qq)
    var Time = 5;
    let now_Time = new Date().getTime(); //获取当前时间戳
    Time = parseInt(60000 * Time);
    let last_time = await redis.get('xiuxian:player:' + usr_qq + 'BOSSCD'); //获得上次的时间戳,
    last_time = parseInt(last_time);
    if (now_Time < last_time + Time) {
      let Couple_m = Math.trunc((last_time + Time - now_Time) / 60 / 1000);
      let Couple_s = Math.trunc(((last_time + Time - now_Time) % 60000) / 1000);
      e.reply('正在CD中，' + `剩余cd:  ${Couple_m}分 ${Couple_s}秒`);
      return false;
    }
    if (data.existData('player', usr_qq)) {
      let player = await data.getData('player', usr_qq);
      if (player.level_id > 41 || player.lunhui > 0) {
        e.reply('仙人不得下凡');
        return false;
      }
      if (player.level_id < 22) {
        e.reply('修为至少达到化神初期才能参与挑战');
        return false;
      }
      let action = await redis.get('xiuxian:player:' + usr_qq + ':action');
      action = JSON.parse(action);
      if (action != null) {
        let action_end_time = action.end_time;
        let now_time = new Date().getTime();
        if (now_time <= action_end_time) {
          let m = parseInt((action_end_time - now_time) / 1000 / 60);
          let s = parseInt((action_end_time - now_time - m * 60 * 1000) / 1000);
          e.reply(
            '正在' + action.action + '中,剩余时间:' + m + '分' + s + '秒'
          );
          return false;
        }
      }
      if (player.当前血量 <= player.血量上限 * 0.1) {
        e.reply('还是先疗伤吧，别急着参战了');
        return false;
      }
      if (WorldBOSSBattleCD[usr_qq]) {
        let Seconds = Math.trunc(
          (300000 - (new Date().getTime() - WorldBOSSBattleCD[usr_qq])) / 1000
        );
        if (Seconds <= 300 && Seconds >= 0) {
          e.reply(
            `刚刚一战消耗了太多气力，还是先歇息一会儿吧~(剩余${Seconds}秒)`
          );
          return false;
        }
      }

      let WorldBossStatusStr = await redis.get('Xiuxian:WorldBossStatus2');
      let PlayerRecord = await redis.get('xiuxian@1.3.0Record2');
      let WorldBossStatus = JSON.parse(WorldBossStatusStr);
      if (new Date().getTime() - WorldBossStatus.KilledTime < 86400000) {
        e.reply(`金角大王正在刷新,20点开启`);
        return false;
      } else if (WorldBossStatus.KilledTime != -1) {
        if ((await InitWorldBoss(e)) == 0) await this.WorldBossBattle(e);
        return false;
      }
      let PlayerRecordJSON, Userid;
      if (PlayerRecord == 0) {
        let QQGroup = [],
          DamageGroup = [],
          Name = [];
        QQGroup[0] = usr_qq;
        DamageGroup[0] = 0;
        Name[0] = player.名号;
        PlayerRecordJSON = {
          QQ: QQGroup,
          TotalDamage: DamageGroup,
          Name: Name,
        };
        Userid = 0;
      } else {
        PlayerRecordJSON = JSON.parse(PlayerRecord);
        let i;
        for (i = 0; i < PlayerRecordJSON.QQ.length; i++) {
          if (PlayerRecordJSON.QQ[i] == usr_qq) {
            Userid = i;
            break;
          }
        }
        if (!Userid && Userid != 0) {
          PlayerRecordJSON.QQ[i] = usr_qq;
          PlayerRecordJSON.Name[i] = player.名号;
          PlayerRecordJSON.TotalDamage[i] = 0;
          Userid = i;
        }
      }
      let TotalDamage = 0;
      let Boss = {
        名号: '银角大王',
        攻击: parseInt(player.攻击 * (0.8 + 0.4 * Math.random())),
        防御: parseInt(player.防御 * (0.8 + 0.4 * Math.random())),
        当前血量: parseInt(player.血量上限 * (0.8 + 400000 * Math.random())),
        暴击率: player.暴击率,
        灵根: player.灵根,
        法球倍率: player.灵根.法球倍率,
      };
      player.法球倍率 = player.灵根.法球倍率;
      if (WorldBOSSBattleUnLockTimer) clearTimeout(WorldBOSSBattleUnLockTimer);
      SetWorldBOSSBattleUnLockTimer(e);
      if (WorldBOSSBattleLock != 0) {
        e.reply(
          '好像有人正在和银角大王激战，现在去怕是有未知的凶险，还是等等吧！'
        );
        return false;
      }
      WorldBOSSBattleLock = 1;
      let Data_battle = await zd_battle(player, Boss);
      let msg = Data_battle.msg;
      let A_win = `${player.名号}击败了${Boss.名号}`;
      let B_win = `${Boss.名号}击败了${player.名号}`;
      if (msg.length <= 60) await ForwardMsg(e, msg);
      else {
        let msgg = JSON.parse(JSON.stringify(msg));
        msgg.length = 60;
        await ForwardMsg(e, msgg);
        e.reply('战斗过长，仅展示部分内容');
      }
      await sleep(1000);
      if (!WorldBossStatus.Healthmax) {
        e.reply('请联系管理员重新开启!');
        return false;
      }
      if (msg.find(item => item == A_win)) {
        TotalDamage = Math.trunc(
          WorldBossStatus.Healthmax * 0.06 +
            Harm(player.攻击 * 0.85, Boss.防御) * 10
        );
        WorldBossStatus.Health -= TotalDamage;
        e.reply(
          `${player.名号}击败了[${Boss.名号}],重创[金角大王],造成伤害${TotalDamage}`
        );
      } else if (msg.find(item => item == B_win)) {
        TotalDamage = Math.trunc(
          WorldBossStatus.Healthmax * 0.04 +
            Harm(player.攻击 * 0.85, Boss.防御) * 6
        );
        WorldBossStatus.Health -= TotalDamage;
        e.reply(
          `${player.名号}被[${Boss.名号}]击败了,只对[金角大王]造成了${TotalDamage}伤害`
        );
      }
      await Add_HP(usr_qq, Data_battle.A_xue);
      await sleep(1000);
      let random = Math.random();
      if (random < 0.05 && msg.find(item => item == A_win)) {
        e.reply(
          '这场战斗重创了[金角大王]，金角大王使用了古典秘籍,血量回复了10%'
        );
        WorldBossStatus.Health += Math.trunc(WorldBossStatus.Healthmax * 0.1);
      } else if (random > 0.95 && msg.find(item => item == B_win)) {
        TotalDamage += Math.trunc(WorldBossStatus.Health * 0.15);
        WorldBossStatus.Health -= Math.trunc(WorldBossStatus.Health * 0.15);
        e.reply(
          `危及时刻,万先盟-韩立前来助阵,对[金角大王]造成${Math.trunc(
            WorldBossStatus.Health * 0.15
          )}伤害,并治愈了你的伤势`
        );
        await Add_HP(usr_qq, player.血量上限);
      }
      await sleep(1000);
      PlayerRecordJSON.TotalDamage[Userid] += TotalDamage;
      redis.set('xiuxian@1.3.0Record2', JSON.stringify(PlayerRecordJSON));
      redis.set('Xiuxian:WorldBossStatus2', JSON.stringify(WorldBossStatus));
      if (WorldBossStatus.Health <= 0) {
        e.reply('金角大王被击杀！玩家们可以根据贡献获得奖励！');
        await sleep(1000);
        let msg2 =
          '【全服公告】' +
          player.名号 +
          '亲手结果了金角大王的性命,为民除害,额外获得500000灵石奖励！';
        const redisGlKey = 'xiuxian:AuctionofficialTask_GroupList';
        const groupList = await redis.sMembers(redisGlKey);
        for (const group_id of groupList) {
          await pushInfo(group_id, true, msg2);
        }
        await Add_灵石(usr_qq, 500000);
        e.reply(`[金角大王] 结算:${usr_qq}增加奖励500000`);

        WorldBossStatus.KilledTime = new Date().getTime();
        redis.set('Xiuxian:WorldBossStatus2', JSON.stringify(WorldBossStatus));
        let PlayerList = await SortPlayer(PlayerRecordJSON);
        e.reply(
          '正在进行存档有效性检测，如果长时间没有回复请联系主人修复存档并手动按照贡献榜发放奖励'
        );
        for (let i = 0; i < PlayerList.length; i++)
          await data.getData('player', PlayerRecordJSON.QQ[PlayerList[i]]);
        let Show_MAX;
        let Rewardmsg = ['****金角大王周本贡献排行榜****'];
        if (PlayerList.length > 20) Show_MAX = 20;
        else Show_MAX = PlayerList.length;
        let TotalDamage = 0;
        for (
          let i = 0;
          i < (PlayerList.length <= 20 ? PlayerList.length : 20);
          i++
        )
          TotalDamage += PlayerRecordJSON.TotalDamage[PlayerList[i]];
        for (var i = 0; i < PlayerList.length; i++) {
          let CurrentPlayer = await data.getData(
            'player',
            PlayerRecordJSON.QQ[PlayerList[i]]
          );
          if (i < Show_MAX) {
            let Reward = Math.trunc(
              (PlayerRecordJSON.TotalDamage[PlayerList[i]] / TotalDamage) *
                WorldBossStatus.Reward
            );
            Reward = Reward < 200000 ? 200000 : Reward;
            Rewardmsg.push(
              '第' +
                `${i + 1}` +
                '名:\n' +
                `名号:${CurrentPlayer.名号}` +
                '\n' +
                `伤害:${PlayerRecordJSON.TotalDamage[PlayerList[i]]}` +
                '\n' +
                `获得灵石奖励${Reward}`
            );
            CurrentPlayer.灵石 += Reward;
            data.setData(
              'player',
              PlayerRecordJSON.QQ[PlayerList[i]],
              CurrentPlayer
            );
            e.reply(
              `[金角大王周本] 结算:${
                PlayerRecordJSON.QQ[PlayerList[i]]
              }增加奖励${Reward}`
            );
            continue;
          } else {
            CurrentPlayer.灵石 += 200000;
            e.reply(
              `[金角大王周本] 结算:${
                PlayerRecordJSON.QQ[PlayerList[i]]
              }增加奖励200000`
            );
            data.setData(
              'player',
              PlayerRecordJSON.QQ[PlayerList[i]],
              CurrentPlayer
            );
          }
          if (i == PlayerList.length - 1)
            Rewardmsg.push('其余参与的修仙者均获得200000灵石奖励！');
        }
        await ForwardMsg(e, Rewardmsg);
      }
      WorldBOSSBattleCD[usr_qq] = new Date().getTime();
      WorldBOSSBattleLock = 0;
      return false;
    } else {
      e.reply('区区凡人，也想参与此等战斗中吗？');
      return false;
    }
  }
}

//初始化金角大王
async function InitWorldBoss(e) {
  let AverageDamageStruct = await GetAverageDamage(e);
  let player_quantity = parseInt(AverageDamageStruct.player_quantity);
  let AverageDamage = parseInt(AverageDamageStruct.AverageDamage);
  let Reward = 6000000;
  WorldBOSSBattleLock = 0;
  if (player_quantity == 0) {
    return - 1;
  }
  if (player_quantity < 5) Reward = 3000000;
  let X = AverageDamage * 0.01;
  e.reply(`[金角大王] 化神玩家总数：${player_quantity}`);
  e.reply(`[金角大王] 生成基数:${X}`);
  let Health = Math.trunc(X * 150 * player_quantity * 2); //血量要根据人数来
  let WorldBossStatus = {
    Health: Health,
    Healthmax: Health,
    KilledTime: -1,
    Reward: Reward,
  };
  let PlayerRecord = 0;
  await redis.set('Xiuxian:WorldBossStatus2', JSON.stringify(WorldBossStatus));
  await redis.set('xiuxian@1.3.0Record2', JSON.stringify(PlayerRecord));
  let msg = '【全服公告】金角大王已经苏醒,击杀者额外获得50w灵石';
  const redisGlKey = 'xiuxian:AuctionofficialTask_GroupList';
  const groupList = await redis.sMembers(redisGlKey);
  for (const group_id of groupList) {
    await pushInfo(group_id, true, msg);
  }
  return 0;
}

async function pushInfo(id, is_group, msg) {
  if (is_group) {
    await Bot.pickGroup(id)
      .sendMsg(msg)
      .catch(err => {
        e.reply(err);
      });
  } else {
    await common.relpyPrivate(id, msg);
  }
}

//获取金角大王是否已开启
async function BossIsAlive() {
  return (
    (await redis.get('Xiuxian:WorldBossStatus2')) &&
      (await redis.get('xiuxian@1.3.0Record2'))
  );
}

//排序
async function SortPlayer(PlayerRecordJSON) {
  if (PlayerRecordJSON) {
    let Temp0 = JSON.parse(JSON.stringify(PlayerRecordJSON));
    let Temp = Temp0.TotalDamage;
    let SortResult = [];
    Temp.sort(function (a, b) {
      return b - a;
    });
    for (let i = 0; i < PlayerRecordJSON.TotalDamage.length; i++) {
      for (let s = 0; s < PlayerRecordJSON.TotalDamage.length; s++) {
        if (Temp[i] == PlayerRecordJSON.TotalDamage[s]) {
          SortResult[i] = s;
          break;
        }
      }
    }
    return SortResult;
  }
}
//设置防止锁卡死的计时器
async function SetWorldBOSSBattleUnLockTimer(e) {
  WorldBOSSBattleUnLockTimer = setTimeout(() => {
    if (WorldBOSSBattleLock == 1) {
      WorldBOSSBattleLock = 0;
      e.reply('检测到战斗锁卡死，已自动修复');
      return false;
    }
  }, 30000);
}

//sleep
async function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

//获取玩家平均实力和化神以上人数
async function GetAverageDamage(e) {
  let File = fs.readdirSync(data.filePathMap.player);
  File = File.filter(file => file.endsWith('.json'));
  let temp = [];
  let TotalPlayer = 0;
  for (var i = 0; i < File.length; i++) {
    let this_qq = File[i].replace('.json', '');

    let player = await data.getData('player', this_qq);
    if (player.level_id > 21 && player.level_id < 42 && player.lunhui == 0) {
      temp[TotalPlayer] = parseInt(player.攻击);
      e.reply(`[金角大王] ${this_qq}玩家攻击:${temp[TotalPlayer]}`);
      TotalPlayer++;
    }
  }
  //排序
  temp.sort(function (a, b) {
    return b - a;
  });
  let AverageDamage = 0;
  if (TotalPlayer > 15)
    for (let i = 2; i < temp.length - 4; i++) AverageDamage += temp[i];
  else for (let i = 0; i < temp.length; i++) AverageDamage += temp[i];
  AverageDamage =
    TotalPlayer > 15
      ? AverageDamage / (temp.length - 6)
      : temp.length == 0
      ? 0
      : AverageDamage / temp.length;
  let res = {
    AverageDamage: AverageDamage,
    player_quantity: TotalPlayer,
  };
  return res;
}
