import { plugin, verc, data, config } from '../../api/api.js';
import fs, { write } from 'fs';
import {
  Read_player,
  existplayer,
  get_random_talent,
  getLastsign,
    Write_equipment,
  Write_player,
  Write_najie,
} from '../../model/xiuxian.js';
import {
  shijianc,
  get_random_fromARR,
  isNotNull,
  Write_danyao,
  Go,
  get_player_img,
  get_log_img,
  channel
} from '../../model/xiuxian.js';
import{
  readall,
  dataall,
  alluser,
  
} from '../../model/duanzaofu.js';

import { Add_HP, Add_修为, Add_najie_thing } from '../../model/xiuxian.js';
import { __PATH } from '../../model/xiuxian.js';
import { userInfo } from 'os';
export class UserStart extends plugin {
  constructor() {
    super({
      name: 'UserStart',
      dsc: '交易模块',
      event: 'message',
      rule: [
        {
          reg: '^#踏入仙途$',
          fnc: 'Create_player',
        },
        {
          reg: '^#全员重签$',
          fnc: 'allcs',
        },
        {
          reg: '^#再入仙途$',
          fnc: 'reCreate_player',
        },
        {
          reg: '^#我的练气$',
          fnc: 'Show_player',
        },
        {
          reg: '^#设置性别.*$',
          fnc: 'Set_sex',
        },
        {
          reg: '^#(改名.*)|(设置道宣.*)$',
          fnc: 'Change_player_name',
        },
        {
          reg: '^#修仙签到$',
          fnc: 'daily_gift',
        },
        {
          reg: '^#新手教程$',
          fnc: 'cs',
        },
      ],
    });
  }
  async cs(e){

    e.reply('仙凡有别 渡劫一念天地宽\n仙路漫漫 一见鸡哥道成空\n攻略 docs.qq.com/doc/DY25pbVlEakJaaW1u ')
  }
  //#踏入仙途
  async Create_player(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //判断是否为匿名创建存档
    if (usr_qq == 80000000) return false;
    //有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (ifexistplay) {
      this.Show_player(e);
      return false;
    }
    //初始化玩家信息
    let File_msg = fs.readdirSync(__PATH.player_path);
    let n = File_msg.length + 1;
    let talent = await get_random_talent();
    let new_player = {
      id: usr_qq,
      sex: 0, //性别
      名号: `路人甲${n}号`,
      宣言: '这个人很懒还没有写',
      level_id: 1, //练气境界
      Physique_id: 1, //练体境界
      race: 1, //种族
      修为: 1, //练气经验
      血气: 1, //练体经验
      灵石: 10000,
      灵根: talent,
      神石: 0,
      favorability: 0,
      breakthrough: false,
      linggen: [],
      linggenshow: 1, //灵根显示，隐藏
      学习的功法: [],
      修炼效率提升: talent.eff,
      连续签到天数: 0,
      攻击加成: 0,
      防御加成: 0,
      生命加成: 0,
      power_place: 1, //仙界状态
      当前血量: 8000,
      lunhui: 0,
      lunhuiBH: 0,
      轮回点: 10,
      occupation: [], //职业
      occupation_level: 1,
      镇妖塔层数: 0,
      神魄段数: 0,
      魔道值: 0,
      仙宠: [],
      练气皮肤: 0,
      装备皮肤: 0,
      纳戒皮肤: 0,
      幸运: 0,
      addluckyNo: 0,
      师徒任务阶段: 0,
      师徒积分: 0,
    };

    //初始化装备
    let new_equipment = {
      武器: data.equipment_list.find(item => item.name == '烂铁匕首'),
      护具: data.equipment_list.find(item => item.name == '破铜护具'),
      法宝: data.equipment_list.find(item => item.name == '廉价炮仗'),
    };
    //初始化纳戒
    let new_najie = {
      等级: 1,
      灵石上限: 5000,
      灵石: 0,
      装备: [],
      丹药: [],
      道具: [],
      功法: [],
      草药: [],
      材料: [],
      仙宠: [],
      仙宠口粮: [],
      宝石:[],
    };
    await Write_player(usr_qq, new_player);
    await Write_equipment(usr_qq, new_equipment);
    await Write_najie(usr_qq, new_najie);
    await Add_HP(usr_qq, 999999);
    const arr = {
      biguan: 0, //闭关状态
      biguanxl: 0, //增加效率
      xingyun: 0,
      lianti: 0,
      ped: 0,
      modao: 0,
      beiyong1: 0, //ped
      beiyong2: 0,
      beiyong3: 0,
      beiyong4: 0,
      beiyong5: 0,
    };
    await Write_danyao(usr_qq, arr);
    await this.Show_player(e);
    return false;
  }

  //重新修仙
  async reCreate_player(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
      e.reply('没存档你转世个锤子!');
      return false;
    } else {
      //没有存档，初始化次数
      await redis.set('xiuxian:player:' + usr_qq + ':reCreate_acount', 1);
    }
    let acount = await redis.get(
      'xiuxian:player:' + usr_qq + ':reCreate_acount'
    );
    if (acount == undefined || acount == null || acount == NaN || acount <= 0) {
      await redis.set('xiuxian:player:' + usr_qq + ':reCreate_acount', 1);
    }
    let player = await data.getData('player', usr_qq);
    //重生之前先看状态
    if (player.灵石 <= 0) {
      e.reply(`负债无法再入仙途`);
      return false;
    }
    let flag = await Go(e);
    if (!flag) {
      return false;
    }
    let now = new Date();
    let nowTime = now.getTime(); //获取当前时间戳
    let lastrestart_time = await redis.get(
      'xiuxian:player:' + usr_qq + ':last_reCreate_time'
    ); //获得上次重生时间戳,
    lastrestart_time = parseInt(lastrestart_time);
    const cf = config.getConfig('xiuxian', 'xiuxian');
    const time = cf.CD.reborn;
    let rebornTime = parseInt(60000 * time);
    if (nowTime < lastrestart_time + rebornTime) {
      let waittime_m = Math.trunc(
        (lastrestart_time + rebornTime - nowTime) / 60 / 1000
      );
      let waittime_s = Math.trunc(
        ((lastrestart_time + rebornTime - nowTime) % 60000) / 1000
      );
      e.reply(
        `每${rebornTime / 60 / 1000}分钟只能转世一次` +
          `剩余cd:${waittime_m}分 ${waittime_s}秒`
      );
      return false;
    }
    /** 设置上下文 */
    this.setContext('RE_xiuxian');
    /** 回复 */
    await e.reply(
      '一旦转世一切当世与你无缘,你真的要重生吗?回复:【断绝此生】或者【再继仙缘】进行选择',
      false,
      { at: true }
    );
    return false;
  }

  //重生方法
  async RE_xiuxian(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    /** 内容 */
    let new_msg = this.e.message;
    let choice = new_msg[0].text;
    let now = new Date();
    let nowTime = now.getTime(); //获取当前时间戳
    if (choice == '再继仙缘') {
      await this.reply('重拾道心,继续修行');
      /** 结束上下文 */
      this.finish('RE_xiuxian');
      return false;
    } else if (choice == '断绝此生') {
      //得到重生次数
      let acount = await redis.get(
        'xiuxian:player:' + usr_qq + ':reCreate_acount'
      );
      //
      if (acount >= 15) {
        e.reply('灵魂虚弱，已不可转世！');
        return false;
      }
      acount = Number(acount);
      acount++;
      //重生牵扯到宗门模块
      let player = await data.getData('player', usr_qq);
      if (isNotNull(player.宗门)) {
        if (player.宗门.职位 != '宗主') {
          //不是宗主
          let ass = data.getAssociation(player.宗门.宗门名称);
          ass[player.宗门.职位] = ass[player.宗门.职位].filter(
            item => item != usr_qq
          );
          ass['所有成员'] = ass['所有成员'].filter(item => item != usr_qq); //原来的成员表删掉这个B
          await data.setAssociation(ass.宗门名称, ass);
          delete player.宗门;
          await data.setData('player', usr_qq, player);
        } else {
          //是宗主
          let ass = data.getAssociation(player.宗门.宗门名称);
          if (ass.所有成员.length < 2) {
            fs.rmSync(
              `${data.filePathMap.association}/${player.宗门.宗门名称}.json`
            );
          } else {
            ass['所有成员'] = ass['所有成员'].filter(item => item != usr_qq); //原来的成员表删掉这个B
            //随机一个幸运儿的QQ,优先挑选等级高的
            let randmember_qq;
            if (ass.长老.length > 0) {
              randmember_qq = await get_random_fromARR(ass.长老);
            } else if (ass.内门弟子.length > 0) {
              randmember_qq = await get_random_fromARR(ass.内门弟子);
            } else {
              randmember_qq = await get_random_fromARR(ass.所有成员);
            }
            let randmember = await data.getData('player', randmember_qq); //获取幸运儿的存档
            ass[randmember.宗门.职位] = ass[randmember.宗门.职位].filter(
              item => item != randmember_qq
            ); //原来的职位表删掉这个幸运儿
            ass['宗主'] = randmember_qq; //新的职位表加入这个幸运儿
            randmember.宗门.职位 = '宗主'; //成员存档里改职位
            await data.setData('player', randmember_qq, randmember); //记录到存档
            await data.setAssociation(ass.宗门名称, ass); //记录到宗门
          }
        }
      }
      fs.rmSync(`${__PATH.player_path}/${usr_qq}.json`);
      fs.rmSync(`${__PATH.equipment_path}/${usr_qq}.json`);
      fs.rmSync(`${__PATH.najie_path}/${usr_qq}.json`);
      e.reply([segment.at(usr_qq), '当前存档已清空!开始重生']);
      e.reply([
        segment.at(usr_qq),
        '来世，信则有，不信则无，岁月悠悠，世间终会出现两朵相同的花，千百年的回眸，一花凋零，一花绽。是否为同一朵，任后人去评断！！',
      ]);
      await this.Create_player(e);
      await redis.set(
        'xiuxian:player:' + usr_qq + ':last_reCreate_time',
        nowTime
      ); //redis设置本次改名时间戳
      await redis.set('xiuxian:player:' + usr_qq + ':reCreate_acount', acount);
    } else {
      this.setContext('RE_xiuxian');
      await this.reply('请回复:【断绝此生】或者【再继仙缘】进行选择', false, {
        at: true,
      });
      return false;
    }
    /** 结束上下文 */
    this.finish('RE_xiuxian');
    return false;
  }

  //#我的练气
  async Show_player(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);

    //有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let img = await get_player_img(e);
    e.reply(img);
    return false;
  }

  async Set_sex(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let player = await Read_player(usr_qq);
    if (player.sex != 0) {
      e.reply('每个存档仅可设置一次性别！');
      return false;
    }
    //命令判断
    let msg = e.msg.replace('#设置性别', '');
    if (msg != '男' && msg != '女') {
      e.reply('请发送#设置性别男 或 #设置性别女');
      return false;
    }
    player.sex = msg == '男' ? 2 : 1;
    await data.setData('player', usr_qq, player);
    e.reply(`${player.名号}的性别已成功设置为 ${msg}。`);
  }

  //改名
  async Change_player_name(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //有无存档
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    //检索方法
    var reg = new RegExp(/改名|设置道宣/);
    let func = reg.exec(e.msg);
    //
    if (func == '改名') {
      let new_name = e.msg.replace('#改名', '');
      new_name = new_name.replace(' ', '');
      new_name = new_name.replace('+', '');
      if (new_name.length == 0) {
        e.reply('改名格式为:【#改名张三】请输入正确名字');
        return false;
      } else if (new_name.length > 8) {
        e.reply('玩家名字最多八字');
        return false;
      }
      let player = {};
      let now = new Date();
      let nowTime = now.getTime(); //获取当前日期的时间戳
      //let Yesterday = await shijianc(nowTime - 24 * 60 * 60 * 1000);//获得昨天日期
      let Today = await shijianc(nowTime);
      let lastsetname_time = await redis.get(
        'xiuxian:player:' + usr_qq + ':last_setname_time'
      ); //获得上次改名日期,
      lastsetname_time = parseInt(lastsetname_time);
      lastsetname_time = await shijianc(lastsetname_time);
      if (
        Today.Y == lastsetname_time.Y &&
        Today.M == lastsetname_time.M &&
        Today.D == lastsetname_time.D
      ) {
        e.reply('每日只能改名一次');
        return false;
      }
      player = await Read_player(usr_qq);
      if (player.灵石 < 1000) {
        e.reply('改名需要1000灵石');
        return false;
      }      
      
      let arr=await alluser()
      for(let z=0;z<arr.length;z++){
        let B=await Read_player(arr[z])
        if(new_name==B.名号){
          e.reply("这世间已存在该名字的人:"+arr[z])
          return
        }
      }
      
      player.名号 = new_name;
      redis.set('xiuxian:player:' + usr_qq + ':last_setname_time', nowTime); //redis设置本次改名时间戳
      player.灵石 -= 1000;
      await Write_player(usr_qq, player);
      //Add_灵石(usr_qq, -100);
      this.Show_player(e);
      return false;
    }
    //设置道宣
    else if (func == '设置道宣') {
      let new_msg = e.msg.replace('#设置道宣', '');
      new_msg = new_msg.replace(' ', '');
      new_msg = new_msg.replace('+', '');
      if (new_msg.length == 0) {
        return false;
      } else if (new_msg.length > 50) {
        e.reply('道宣最多50字符');
        return false;
      }
      let player = {};
      let now = new Date();
      let nowTime = now.getTime(); //获取当前日期的时间戳
      //let Yesterday = await shijianc(nowTime - 24 * 60 * 60 * 1000);//获得昨天日期
      //
      let Today = await shijianc(nowTime);
      let lastsetxuanyan_time = await redis.get(
        'xiuxian:player:' + usr_qq + ':last_setxuanyan_time'
      );
      //获得上次改道宣日期,
      lastsetxuanyan_time = parseInt(lastsetxuanyan_time);
      lastsetxuanyan_time = await shijianc(lastsetxuanyan_time);
      if (
        Today.Y == lastsetxuanyan_time.Y &&
        Today.M == lastsetxuanyan_time.M &&
        Today.D == lastsetxuanyan_time.D
      ) {
        e.reply('每日仅可更改一次');
        return false;
      }
      //这里有问题，写不进去
      player = await Read_player(usr_qq);
      player.宣言 = new_msg; //
      redis.set('xiuxian:player:' + usr_qq + ':last_setxuanyan_time', nowTime); //redis设置本次设道置宣时间戳
      await Write_player(usr_qq, player);
      this.Show_player(e);
      return false;
    }
  }

  //签到
  async daily_gift(e) {
    if (!verc({ e })) return false;
    let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
    //有无账号
    let ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) return false;
    let now = new Date();
    let nowTime = now.getTime(); //获取当前日期的时间戳
    let Yesterday = await shijianc(nowTime - 24 * 60 * 60 * 1000); //获得昨天日期
    let Today = await shijianc(nowTime);
    let lastsign_time = await getLastsign(usr_qq); //获得上次签到日期
    if (
      Today.Y == lastsign_time.Y &&
      Today.M == lastsign_time.M &&
      Today.D == lastsign_time.D
    ) {
      e.reply(`今日已经签到过了`);
      return false;
    }
    let Sign_Yesterday; //昨日日是否签到
    if (
      Yesterday.Y == lastsign_time.Y &&
      Yesterday.M == lastsign_time.M &&
      Yesterday.D == lastsign_time.D
    ) {
      Sign_Yesterday = true;
    } else {
      Sign_Yesterday = false;
    }
    await redis.set('xiuxian:player:' + usr_qq + ':lastsign_time', nowTime); //redis设置签到时间
    let player = await data.getData('player', usr_qq);
    if (player.连续签到天数 == 7 || !Sign_Yesterday) {
      //签到连续7天或者昨天没有签到,连续签到天数清零
      player.连续签到天数 = 0;
    }
    player.连续签到天数 += 1;
    data.setData('player', usr_qq, player);
    //给奖励
    let gift_xiuwei = player.连续签到天数 * 3000;
    const cf = config.getConfig('xiuxian', 'xiuxian');
    await Add_najie_thing(usr_qq, '秘境之匙', '道具', cf.Sign.ticket);
    let msg = [
      segment.at(usr_qq),
      `已经连续签到${player.连续签到天数}天了，获得了${gift_xiuwei}修为,秘境之匙x${cf.Sign.ticket}`,
    ];
    let b=`${player.名号}已经连续签到${player.连续签到天数}天了，获得了${gift_xiuwei}修为,秘境之匙x${cf.Sign.ticket}`
    let a=''

    await Write_player(usr_qq,player)
    await Add_修为(usr_qq, gift_xiuwei);
    e.reply(b+'\n'+a);
    return false;
  }
  async allcs(e){
    let usr_qq=e.user_id.toString().replace('qg_','')
    usr_qq=await channel(usr_qq)
    if(usr_qq!=3479823546){
      return
    }
    let a=await alluser()
    for(let item of a){
    await redis.set('xiuxian:player:' + item + ':lastsign_time', Date.now()-24*60*60*1000);
    }
    e.reply('成功')
    return
  }
}
