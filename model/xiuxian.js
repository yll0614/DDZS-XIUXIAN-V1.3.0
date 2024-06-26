import fs from 'fs';
import path from 'path';
import puppeteer from '../../../lib/puppeteer/puppeteer.js';

import data from './XiuxianData.js';
import { Writeit, Read_it,readall,dataall } from './duanzaofu.js';
import { AppName } from '../app.config.js';
import config from './Config.js';
import Show from './show.js';
import { log } from 'console';
import { TIMEOUT } from 'dns';
import { userInfo } from 'os';
// import {action_way_fun} from "../apps/Game/action.js";
import{cheakbaoshi}from "../apps/xiangqian/xiangqian.js"

/**
 * 全局
 */
//插件根目录
const __dirname = `${path.resolve()}${path.sep}plugins${path.sep}${AppName}`;
// 文件存放路径
export const __PATH = {
  //更新日志
  updata_log_path: path.join(__dirname, 'vertion.txt'),
  //用户数据
  player_path: path.join(__dirname, '/resources/data/xiuxian_player'),
  //装备
  equipment_path: path.join(__dirname, '/resources/data/xiuxian_equipment'),
  //纳戒
  najie_path: path.join(__dirname, '/resources/data/xiuxian_najie'),
  //丹药
  danyao_path: path.join(__dirname, '/resources/data/xiuxian_danyao'),
  //源数据
  lib_path: path.join(__dirname, '/resources/data/item'),
  Timelimit: path.join(__dirname, '/resources/data/Timelimit'),
  Exchange: path.join(__dirname, '/resources/data/Exchange'),
  shop: path.join(__dirname, '/resources/data/shop'),
  log_path: path.join(__dirname, '/resources/data/suduku'),
  association: path.join(__dirname, '/resources/data/association'),
  renwu: path.join(__dirname, '/resources/data/renwu'),
  tiandibang: path.join(__dirname, '/resources/data/tiandibang'),
  qinmidu: path.join(__dirname, '/resources/data/qinmidu'),
  backup: path.join(__dirname, '/resources/backup'),
  player_pifu_path: path.join(__dirname, '/resources/img/player_pifu'),
  shitu: path.join(__dirname, '/resources/data/shitu'),
  equipment_pifu_path: path.join(__dirname, '/resources/img/equipment_pifu'),
  duanlu: path.join(__dirname, '/resources/data/duanlu'),
  temp_path: path.join(__dirname, '/resources/data/temp'),
  custom: path.join(__dirname, '/resources/data/custom'),
  auto_backup: path.join(__dirname, '/resources/data/auto_backup'),
  channel: path.join(__dirname, '/resources/data/channel'),
  chengzhang: path.join(__dirname, '/resources/data/chengzhang'),
  equipment_list: path.join(__dirname, '/resources/data/item'),

};

const 体质概率 = 0.2;
const 伪灵根概率 = 0.37;
const 真灵根概率 = 0.29;
const 天灵根概率 = 0.08;
const 圣体概率 = 0.01;
const 变异灵根概率 =
  1 - 体质概率 - 伪灵根概率 - 真灵根概率 - 天灵根概率 - 圣体概率;

//检查存档是否存在，存在返回true;
export async function existplayer(usr_qq) {
  let exist_player;
  exist_player = fs.existsSync(`${__PATH.player_path}/${usr_qq}.json`);

  if (exist_player) {
    return true;
  }
  return false;
}

/**
 * 
 * @param {*} amount 输入数量
 * @returns 返回正整数
 */
export async function convert2integer(amount) {
  let number = 1;
  let reg = new RegExp(/^[1-9][0-9]{0,12}$/);
  if (!reg.test(amount)) {
    return number;
  } else {
    return parseInt(amount);
  }
}

export async function Locked_najie_thing(usr_qq, thing_name, thing_class,thing_pinji=null) {
    let najie = await Read_najie(usr_qq);
    if (!isNotNull(najie.草药)) {
        najie.草药 = [];
        await Write_najie(usr_qq, najie);
    }
    if (!isNotNull(najie.盒子)) {
        najie.盒子 = [];
        await Write_najie(usr_qq, najie);
    }
    let ifexist;
    if (thing_class == "装备") {
        ifexist = najie.装备.find(item => item.name == thing_name&&item.pinji==thing_pinji);
    }
    if (thing_class == "丹药") {
        ifexist = najie.丹药.find(item => item.name == thing_name);
    }
    if (thing_class == "道具") {
        ifexist = najie.道具.find(item => item.name == thing_name);
    }
    if (thing_class == "功法") {
        ifexist = najie.功法.find(item => item.name == thing_name);
    }
    if (thing_class == "草药") {
        ifexist = najie.草药.find(item => item.name == thing_name);
    }
    if (thing_class == "材料") {
        ifexist = najie.材料.find(item => item.name == thing_name);
    }
    if (thing_class == "食材") {
        ifexist = najie.食材.find(item => item.name == thing_name);
    }
    if (thing_class == "盒子") {
        ifexist = najie.盒子.find(item => item.name == thing_name);
    }
    if (thing_class == "仙宠") {
        ifexist = najie.仙宠.find(item => item.name == thing_name);
    }
    if (thing_class == "仙米") {
        ifexist = najie.仙宠口粮.find(item => item.name == thing_name);
    }
    if (ifexist) {
        return ifexist.islockd;
    }
    return false;
}

export async function Check_thing(data){
    let state=0;
    if (data.id >= 5005000&& data.id <= 5005009) {
        state=1;
    }
    else if (data.id >= 400991 && data.id <= 400999) {
        state=1;
    }
    return state;
}

export async function Read_updata_log() {
  let dir = path.join(`${__PATH.updata_log_path}`);
  let update_log = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  return update_log;
}

//读取存档信息，返回成一个JavaScript对象
export async function Read_player(usr_qq) {
  let dir = path.join(`${__PATH.player_path}/${usr_qq}.json`);
  let player = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  player = JSON.parse(player);
  return player;
}

export async function LevelTask(e, power_n, power_m, power_Grade, aconut) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let msg = [segment.at(Number(usr_qq))];
  //用户信息
  let player = await Read_player(usr_qq);
  //当前系数计算
  let power_distortion = await dujie(usr_qq);
  const yaocaolist = ['凝血草', '小吉祥草', '大吉祥草'];
  for (const j in yaocaolist) {
    const num = await exist_najie_thing(usr_qq, yaocaolist[j], '草药');
    if (num) {
      msg.push(`[${yaocaolist[j]}]为你提高了雷抗\n`);
      power_distortion = Math.trunc(power_distortion * (1 + 0.2 * j));
      await Add_najie_thing(usr_qq, yaocaolist[j], '草药', -1);
    }
    let variable = Math.random() * (power_m - power_n) + power_n;
    //根据雷伤害的次数畸变.最高可达到+1.2
    variable = variable + aconut / 10;
    variable = Number(variable);
    //对比系数
    if (power_distortion >= variable) {
      //判断目前是第几雷，第九就是过了
      if (aconut >= power_Grade) {
        player.power_place = 0;
        await Write_player(usr_qq, player);
        msg.push(
          '\n' +
            player.名号 +
            '成功度过了第' +
            aconut +
            '道雷劫！可以#登仙，飞升仙界啦！'
        );
        e.reply(msg);
        return 0;
      } else {
        //血量计算根据雷来计算！
        let act = variable - power_n;
        act = act / (power_m - power_n);
        player.当前血量 = Math.trunc(player.当前血量 - player.当前血量 * act);
        await Write_player(usr_qq, player);
        msg.push(
          '\n本次雷伤：' +
            variable.toFixed(2) +
            '\n本次雷抗：' +
            power_distortion +
            '\n' +
            player.名号 +
            '成功度过了第' +
            aconut +
            '道雷劫！\n下一道雷劫在一分钟后落下！'
        );
        e.reply(msg);
        return 1;
      }
    } else {
      //血量情况
      player.当前血量 = 1;
      //扣一半修为
      player.修为 = Math.trunc(player.修为 * 0.5);
      player.power_place = 1;
      await Write_player(usr_qq, player);
      //未挡住雷杰
      msg.push(
        '\n本次雷伤' +
          variable.toFixed(2) +
          '\n本次雷抗：' +
          power_distortion +
          '\n第' +
          aconut +
          '道雷劫落下了，可惜' +
          player.名号 +
          '未能抵挡，渡劫失败了！'
      );
      e.reply(msg);
      return 0;
    }
  }
}

//写入存档信息,第二个参数是一个JavaScript对象
export async function Write_player(usr_qq, player) {
  let dir = path.join(__PATH.player_path, `${usr_qq}.json`);
  let new_ARR = JSON.stringify(player, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return;
}

//读取装备信息，返回成一个JavaScript对象
export async function Read_equipment(usr_qq) {
  let dir = path.join(`${__PATH.equipment_path}/${usr_qq}.json`);
  let equipment = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  equipment = JSON.parse(equipment);
  return equipment;
}

//写入装备信息,第二个参数是一个JavaScript对象
export async function Write_equipment(usr_qq, equipment) {
  let player = await Read_player(usr_qq);
  player.攻击 =
    data.Level_list.find(item => item.level_id == player.level_id).基础攻击 +
    player.攻击加成 +
    data.LevelMax_list.find(item => item.level_id == player.Physique_id)
      .基础攻击;
  player.防御 =
    data.Level_list.find(item => item.level_id == player.level_id).基础防御 +
    player.防御加成 +
    data.LevelMax_list.find(item => item.level_id == player.Physique_id)
      .基础防御;
  player.血量上限 =
    data.Level_list.find(item => item.level_id == player.level_id).基础血量 +
    player.生命加成 +
    data.LevelMax_list.find(item => item.level_id == player.Physique_id)
      .基础血量;
  player.暴击率 =
    data.Level_list.find(item => item.level_id == player.level_id).基础暴击 +
    data.LevelMax_list.find(item => item.level_id == player.Physique_id)
      .基础暴击;
  let type = ['武器', '护具', '法宝'];
  for (let i of type) {
    if (
      equipment[i].atk > 10 ||
      equipment[i].def > 10 ||
      equipment[i].HP > 10
    ) {
      player.攻击 += equipment[i].atk;
      player.防御 += equipment[i].def;
      player.血量上限 += equipment[i].HP;
    } else {
      player.攻击 = Math.trunc(player.攻击 * (1 + equipment[i].atk));
      player.防御 = Math.trunc(player.防御 * (1 + equipment[i].def));
      player.血量上限 = Math.trunc(player.血量上限 * (1 + equipment[i].HP));
    }
    player.暴击率 += equipment[i].bao;
  }
  player.暴击伤害 = player.暴击率 + 1.5;
  if (player.暴击伤害 > 2.5) player.暴击伤害 = 2.5;
  if (player.仙宠.type == '暴伤') player.暴击伤害 += player.仙宠.加成;
  await Write_player(usr_qq, player);
  await Add_HP(usr_qq, 0);
  let dir = path.join(__PATH.equipment_path, `${usr_qq}.json`);
  let new_ARR = JSON.stringify(equipment, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return;
}

//读取纳戒信息，返回成一个JavaScript对象
export async function Read_najie(usr_qq) {
  let dir = path.join(`${__PATH.najie_path}/${usr_qq}.json`);
  let najie = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  try {
    najie = JSON.parse(najie);
  } catch {
    //转换不了，纳戒错误
    await fixed(usr_qq);
    najie = await Read_najie(usr_qq);
  }
  return najie;
}
/**
 * 返回该玩家的仙宠图片
 * @return image
 */
export async function get_XianChong_img(e) {
  let i;
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let player = await data.getData('player', usr_qq);
  let najie = await Read_najie(usr_qq);
  let XianChong_have = [];
  let XianChong_need = [];
  let Kouliang = [];
  let XianChong_list = data.xianchon;
  let Kouliang_list = data.xianchonkouliang;
  for (i = 0; i < XianChong_list.length; i++) {
    if (najie.仙宠.find(item => item.name == XianChong_list[i].name)) {
      XianChong_have.push(XianChong_list[i]);
    } else if (player.仙宠.name == XianChong_list[i].name) {
      XianChong_have.push(XianChong_list[i]);
    } else {
      XianChong_need.push(XianChong_list[i]);
    }
  }
  for (i = 0; i < Kouliang_list.length; i++) {
    Kouliang.push(Kouliang_list[i]);
  }
  let player_data = {
    nickname: player.名号,
    XianChong_have,
    XianChong_need,
    Kouliang,
  };
  const data1 = await new Show(e).get_xianchong(player_data);
  return await puppeteer.screenshot('xianchong', {
    ...data1,
  });
}
/**
 * 通用消息图片
 * @return image
 */
export async function get_log_img(e){
  let log2=e
  let log={
    log:log2
  }

  const data1 = await new Show(e).get_log(log);
  return await puppeteer.screenshot('log', {
    ...data1,
  });
}


/**
 * 沉迷消息图片
 * @return image
 */
export async function get_log2_img(e){
  let log2=e
  let log={
    log:log2
  }

  const data1 = await new Show(e).get_log2(log);
  return await puppeteer.screenshot('log2', {
    ...data1,
  });
}
/**
 * 返回该图片
 * @return image
 */
export async function get_daoju_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let player = await data.getData('player', usr_qq);
  let najie = await Read_najie(usr_qq);
  let daoju_have = [];
  let daoju_need = [];
  for (const i of data.daoju_list) {
    if (najie.道具.find(item => item.name == i.name)) {
      daoju_have.push(i);
    } else {
      daoju_need.push(i);
    }
  }
  let player_data = {
    user_id: usr_qq,
    nickname: player.名号,
    daoju_have,
    daoju_need,
  };
  const data1 = await new Show(e).get_daojuData(player_data);
  return await puppeteer.screenshot('daoju', {
    ...data1,
  });
}

/**
 * 返回该玩家的武器图片
 * @return image
 */
export async function get_wuqi_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let player = await data.getData('player', usr_qq);
  let najie = await Read_najie(usr_qq);
  let equipment = await Read_equipment(usr_qq);
  let wuqi_have = [];
  let wuqi_need = [];
  const wuqi_list = [
    'equipment_list',
    'timeequipmen_list',
    'duanzhaowuqi',
    'duanzhaohuju',
    'duanzhaobaowu',
  ];
  let zb = [];
  for (const i of wuqi_list) {
    for (const j of data[i]) {
      if (
        najie['装备'].find(item => item.name == j.name) &&
        !wuqi_have.find(item => item.name == j.name)
      ) {
        wuqi_have.push(j);
      } else if (
        (equipment['武器'].name == j.name ||
          equipment['法宝'].name == j.name ||
          equipment['护具'].name == j.name) &&
        !wuqi_have.find(item => item.name == j.name)
      ) {
        wuqi_have.push(j);
      } else if (!wuqi_need.find(item => item.name == j.name)) {
        wuqi_need.push(j);
      }
    }
  }

  let player_data = {
    user_id: usr_qq,
    nickname: player.名号,
    wuqi_have,
    wuqi_need,
  };
  const data1 = await new Show(e).get_wuqiData(player_data);
  return await puppeteer.screenshot('wuqi', {
    ...data1,
  });
}

/**
 * 返回该玩家的丹药图片
 * @return image
 */
export async function get_danyao_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  const player = await Read_player(usr_qq);
  const najie = await Read_najie(usr_qq);
  let danyao_have = [];
  let danyao_need = [];
  const danyao = ['danyao_list', 'timedanyao_list', 'newdanyao_list'];
  for (const i of danyao) {
    for (const j of data[i]) {
      if (
        najie['丹药'].find(item => item.name == j.name) &&
        !danyao_have.find(item => item.name == j.name)
      ) {
        danyao_have.push(j);
      } else if (!danyao_need.find(item => item.name == j.name)) {
        danyao_need.push(j);
      }
    }
  }
  let player_data = {
    user_id: usr_qq,
    nickname: player.名号,
    danyao_have,
    danyao_need,
  };
  const data1 = await new Show(e).get_danyaoData(player_data);
  return await puppeteer.screenshot('danyao', {
    ...data1,
  });
}

/**
 * 返回该玩家的功法图片
 * @return image
 */
export async function get_gongfa_img(e) {
  let i;
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let player = await data.getData('player', usr_qq);
  let xuexi_gongfa = player.学习的功法;
  let gongfa_have = [];
  let gongfa_need = [];
  const gongfa = ['gongfa_list', 'timegongfa_list'];
  for (const i of gongfa) {
    for (const j of data[i]) {
      if (
        xuexi_gongfa.find(item => item == j.name) &&
        !gongfa_have.find(item => item.name == j.name)
      ) {
        gongfa_have.push(j);
      } else if (!gongfa_need.find(item => item.name == j.name)) {
        gongfa_need.push(j);
      }
    }
  }
  let player_data = {
    user_id: usr_qq,
    nickname: player.名号,
    gongfa_have,
    gongfa_need,
  };
  const data1 = await new Show(e).get_gongfaData(player_data);
  return await puppeteer.screenshot('gongfa', {
    ...data1,
  });
}

/**
 * 返回该玩家的法体
 * @return image
 */
export async function get_power_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let player = await data.getData('player', usr_qq);
  let lingshi = Math.trunc(player.灵石);
  if (player.灵石 > 999999999999) {
    lingshi = 999999999999;
  }
  data.setData('player', usr_qq, player);
  await player_efficiency(usr_qq);
  if (!isNotNull(player.level_id)) {
    e.reply('请先#同步信息');
    return;
  }
  let this_association;
  if (!isNotNull(player.宗门)) {
    this_association = {
      宗门名称: '无',
      职位: '无',
    };
  } else {
    this_association = player.宗门;
  }
  //境界名字需要查找境界名
  let levelMax = data.LevelMax_list.find(
    item => item.level_id == player.Physique_id
  ).level;
  let need_xueqi = data.LevelMax_list.find(
    item => item.level_id == player.Physique_id
  ).exp;
  let playercopy = {
    user_id: usr_qq,
    nickname: player.名号,
    need_xueqi: need_xueqi,
    xueqi: player.血气,
    levelMax: levelMax,
    lingshi: lingshi,
    镇妖塔层数: player.镇妖塔层数,
    神魄段数: player.神魄段数,
    hgd: player.favorability,
    player_maxHP: player.血量上限,
    player_nowHP: player.当前血量,
    learned_gongfa: player.学习的功法,
    association: this_association,
  };
  const data1 = await new Show(e).get_playercopyData(playercopy);
  return await puppeteer.screenshot('playercopy', {
    ...data1,
  });
}

/**
 * 返回该玩家的存档图片
 * @return image
 */
export async function get_player_img(e) {
  let 法宝评级;
  let 护具评级;
  let 武器评级;
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let player = await data.getData('player', usr_qq);
  let equipment = await data.getData('equipment', usr_qq);
  let player_status = await getPlayerAction(usr_qq);
  let status = '空闲';
  if (player_status.time != null) {
    status = player_status.action + '(剩余时间:' + player_status.time + ')';
  }
  let lingshi = Math.trunc(player.灵石);
  if (player.灵石 > 999999999999) {
    lingshi = 999999999999;
  }
  if (player.宣言 == null || player.宣言 == undefined) {
    player.宣言 = '这个人很懒什么都没写';
  }
  if (player.灵根 == null || player.灵根 == undefined) {
    player.灵根 = await get_random_talent();
  }
  data.setData('player', usr_qq, player);
  await player_efficiency(usr_qq); // 注意这里刷新了修炼效率提升
  if ((await player.linggenshow) != 0) {
    player.灵根.type = '无';
    player.灵根.name = '未知';
    player.灵根.法球倍率 = '0';
    player.修炼效率提升 = '0';
  }
  if (!isNotNull(player.level_id)) {
    e.reply('请先#一键同步');
    return;
  }
  if (!isNotNull(player.sex)) {
    e.reply('请先#一键同步');
    return;
  }
  let nd = '无';
  if (player.隐藏灵根) nd = player.隐藏灵根.name;
  let zd = ['攻击', '防御', '生命加成', '防御加成', '攻击加成'];
  let num = [];
  let p = [];
  let kxjs = [];
  let count = 0;
  for (let j of zd) {
    if (player[j] == 0) {
      p[count] = '';
      kxjs[count] = 0;
      count++;
      continue;
    }
    p[count] = Math.floor(Math.log(player[j]) / Math.LN10);
    num[count] = player[j] * 10 ** -p[count];
    kxjs[count] = `${num[count].toFixed(2)} x 10`;
    count++;
  }
  //境界名字需要查找境界名
  let level = data.Level_list.find(
    item => item.level_id == player.level_id
  ).level;
  let power =
    (player.攻击 * 0.9 +
      player.防御 * 1.1 +
      player.血量上限 * 0.6 +
      player.暴击率 * player.攻击 * 0.5 +
      player.灵根.法球倍率 * player.攻击) /
    10000;
  power = Number(power);
  power = power.toFixed(2);
  let power2 =
    (player.攻击 + player.防御 * 1.1 + player.血量上限 * 0.5) / 10000;
  power2 = Number(power2);
  power2 = power2.toFixed(2);
  let level2 = data.LevelMax_list.find(
    item => item.level_id == player.Physique_id
  ).level;
  let need_exp = data.Level_list.find(
    item => item.level_id == player.level_id
  ).exp;
  let need_exp2 = data.LevelMax_list.find(
    item => item.level_id == player.Physique_id
  ).exp;
  let occupation = player.occupation;
  let occupation_level;
  let occupation_level_name;
  let occupation_exp;
  let occupation_need_exp;
  if (!isNotNull(player.occupation)) {
    occupation = '无';
    occupation_level_name = '-';
    occupation_exp = '-';
    occupation_need_exp = '-';
  } else {
    occupation_level = player.occupation_level;
    occupation_level_name = data.occupation_exp_list.find(
      item => item.id == occupation_level
    ).name;
    occupation_exp = player.occupation_exp;
    occupation_need_exp = data.occupation_exp_list.find(
      item => item.id == occupation_level
    ).experience;
  }
  let this_association;
  if (!isNotNull(player.宗门)) {
    this_association = {
      宗门名称: '无',
      职位: '无',
    };
  } else {
    this_association = player.宗门;
  }
  let pinji = ['劣', '普', '优', '精', '极', '绝', '顶'];
  if (!isNotNull(equipment.武器.pinji)) {
    武器评级 = '无';
  } else {
    武器评级 = pinji[equipment.武器.pinji];
  }
  if (!isNotNull(equipment.护具.pinji)) {
    护具评级 = '无';
  } else {
    护具评级 = pinji[equipment.护具.pinji];
  }
  if (!isNotNull(equipment.法宝.pinji)) {
    法宝评级 = '无';
  } else {
    法宝评级 = pinji[equipment.法宝.pinji];
  }
  let rank_lianqi = data.Level_list.find(
    item => item.level_id == player.level_id
  ).level;
  let expmax_lianqi = data.Level_list.find(
    item => item.level_id == player.level_id
  ).exp;
  let rank_llianti = data.LevelMax_list.find(
    item => item.level_id == player.Physique_id
  ).level;
  let expmax_llianti = need_exp2;
  let rank_liandan = occupation_level_name;
  let expmax_liandan = occupation_need_exp;
  let strand_hp = Strand(player.当前血量, player.血量上限);
  let strand_lianqi = Strand(player.修为, expmax_lianqi);
  let strand_llianti = Strand(player.血气, expmax_llianti);
  let strand_liandan = Strand(occupation_exp, expmax_liandan);
  let Power = GetPower(
    player.攻击,
    player.防御,
    player.血量上限,
    player.暴击率
  );
  let PowerMini = bigNumberTransform(Power);
  lingshi = bigNumberTransform(lingshi);
  let hunyin = '未知';
  let A = usr_qq;
  let qinmidu;
  try {
    qinmidu = await Read_qinmidu();
  } catch {
    //没有建立一个
    await Write_qinmidu([]);
    qinmidu = await Read_qinmidu();
  }
  for (let i = 0; i < qinmidu.length; i++) {
    if (qinmidu[i].QQ_A == A || qinmidu[i].QQ_B == A) {
      if (qinmidu[i].婚姻 > 0) {
        if (qinmidu[i].QQ_A == A) {
          let B = await Read_player(qinmidu[i].QQ_B);
          hunyin = B.名号;
        } else {
          let A = await Read_player(qinmidu[i].QQ_A);
          hunyin = A.名号;
        }
        break;
      }
    }
  }
  let action = player.练气皮肤;

  if(usr_qq==3413211040){action="A"}
  if(usr_qq==3196383818){action="DD"}
  var i = usr_qq;
  var l=0;
      while(i >= 1){
      i=i/10;
      l++;
  }

  let type=[
    "武器",
    "法宝",
    '护具'
  ]
  let equipment_wuqi_1=false
  let equipment_wuqi_2=false
  let equipment_wuqi_3=false

  let equipment_fabao_1=false
  let equipment_fabao_2=false
  let equipment_fabao_3=false

  let equipment_huju_1=false
  let equipment_huju_2=false
  let equipment_huju_3=false

  
  for(let m=0;m<type.length;m++){



      if(type[m]=="武器"){
        if(!equipment[type[m]].hasOwnProperty('宝石位')){
          equipment[type[m]]["宝石位"]={
              "宝石位1": "无",
              "宝石位2": "无",
              "宝石位3": "无",
            }
            await Write_equipment(usr_qq,equipment)
        }

        if(equipment[type[m]]["宝石位"].宝石位1!="无"){
          equipment_wuqi_1=true
        }
        if(equipment[type[m]]["宝石位"].宝石位2!="无"){
          equipment_wuqi_2=true
        }
        if(equipment[type[m]]["宝石位"].宝石位3!="无"){
          equipment_wuqi_3=true
        }
      
      }

      if(type[m]=="法宝"){
        if(!equipment[type[m]].hasOwnProperty('宝石位')){
          equipment[type[m]]["宝石位"]={
              "宝石位1": "无",
              "宝石位2": "无",
              "宝石位3": "无",
            }
            await Write_equipment(usr_qq,equipment)
        }
        if(equipment[type[m]]["宝石位"].宝石位1!="无"){
          equipment_fabao_1=true
        }
        if(equipment[type[m]]["宝石位"].宝石位2!="无"){
          equipment_fabao_2=true
        }
        if(equipment[type[m]]["宝石位"].宝石位3!="无"){
          equipment_fabao_3=true
        }
      
      }


      if(type[m]=="护具"){
        if(!equipment[type[m]].hasOwnProperty('宝石位')){
          equipment[type[m]]["宝石位"]={
              "宝石位1": "无",
              "宝石位2": "无",
              "宝石位3": "无",
            }
            await Write_equipment(usr_qq,equipment)
        }
        if(equipment[type[m]]["宝石位"].宝石位1!="无"){
          equipment_huju_1=true
        }
        if(equipment[type[m]]["宝石位"].宝石位2!="无"){
          equipment_huju_2=true
        }
        if(equipment[type[m]]["宝石位"].宝石位3!="无"){
          equipment_huju_3=true
        }
      
      }

    
  }
  let bao = parseInt(player.暴击率 * 100) + '%';
  equipment.武器.bao = parseInt(equipment.武器.bao * 100) + '%';
  equipment.护具.bao = parseInt(equipment.护具.bao * 100) + '%';
  equipment.法宝.bao = parseInt(equipment.法宝.bao * 100) + '%';
  if(l<11){

  
  let player_data = {
    equipment_wuqi_1:equipment_wuqi_1,
    equipment_wuqi_2:equipment_wuqi_2,
    equipment_wuqi_3:equipment_wuqi_3,
  
    equipment_fabao_1:equipment_fabao_1,
    equipment_fabao_2:equipment_fabao_2,
    equipment_fabao_3:equipment_fabao_3,
  
    equipment_huju_1:equipment_huju_1,
    equipment_huju_2:equipment_huju_2,
    equipment_huju_3:equipment_huju_3,
    neidan: nd,
    pifu: action,
    user_id: usr_qq,
    player, // 玩家数据
    rank_lianqi, // 练气境界
    expmax_lianqi, // 练气需求经验
    rank_llianti, // 炼体境界
    expmax_llianti, // 炼体需求经验
    rank_liandan, // 炼丹境界
    expmax_liandan, // 炼丹需求经验
    equipment, // 装备数据
    talent: parseInt(player.修炼效率提升 * 100), //
    player_action: status, // 当前状态
    this_association, // 宗门信息
    strand_hp,
    strand_lianqi,
    strand_llianti,
    strand_liandan,
    PowerMini, // 玩家战力
    bao,
    nickname: player.名号,
    linggen: player.灵根, //
    declaration: player.宣言,
    need_exp: need_exp,
    need_exp2: need_exp2,
    exp: player.修为,
    exp2: player.血气,
    zdl: power,
    镇妖塔层数: player.镇妖塔层数,
    sh: player.神魄段数,
    mdz: player.魔道值,
    hgd: player.favorability,
    jczdl: power2,
    level: level,
    level2: level2,
    lingshi: lingshi,
    player_maxHP: player.血量上限,
    player_nowHP: player.当前血量,
    player_atk: kxjs[0],
    player_atk2: p[0],
    player_def: kxjs[1],
    player_def2: p[1],
    生命加成: kxjs[2],
    生命加成_t: p[2],
    防御加成: kxjs[3],
    防御加成_t: p[3],
    攻击加成: kxjs[4],
    攻击加成_t: p[4],
    player_bao: player.暴击率,
    player_bao2: player.暴击伤害,
    occupation: occupation,
    occupation_level: occupation_level_name,
    occupation_exp: occupation_exp,
    occupation_need_exp: occupation_need_exp,
    arms: equipment.武器,
    armor: equipment.护具,
    treasure: equipment.法宝,
    association: this_association,
    learned_gongfa: player.学习的功法,
    婚姻状况: hunyin,
    武器评级: 武器评级,
    护具评级: 护具评级,
    法宝评级: 法宝评级,
  };
  const data1 = await new Show(e).get_playerData(player_data);
  return await puppeteer.screenshot('player', {
    ...data1,
  });
  }else{

    let player_data = {
      equipment_wuqi_1:equipment_wuqi_1,
      equipment_wuqi_2:equipment_wuqi_2,
      equipment_wuqi_3:equipment_wuqi_3,
    
      equipment_fabao_1:equipment_fabao_1,
      equipment_fabao_2:equipment_fabao_2,
      equipment_fabao_3:equipment_fabao_3,
    
      equipment_huju_1:equipment_huju_1,
      equipment_huju_2:equipment_huju_2,
      equipment_huju_3:equipment_huju_3,
      touxian:e.user.avatar,
      neidan: nd,
      pifu: action,
      user_id: usr_qq,
      player, // 玩家数据
      rank_lianqi, // 练气境界
      expmax_lianqi, // 练气需求经验
      rank_llianti, // 炼体境界
      expmax_llianti, // 炼体需求经验
      rank_liandan, // 炼丹境界
      expmax_liandan, // 炼丹需求经验
      equipment, // 装备数据
      talent: parseInt(player.修炼效率提升 * 100), //
      player_action: status, // 当前状态
      this_association, // 宗门信息
      strand_hp,
      strand_lianqi,
      strand_llianti,
      strand_liandan,
      PowerMini, // 玩家战力
      bao,
      nickname: player.名号,
      linggen: player.灵根, //
      declaration: player.宣言,
      need_exp: need_exp,
      need_exp2: need_exp2,
      exp: player.修为,
      exp2: player.血气,
      zdl: power,
      镇妖塔层数: player.镇妖塔层数,
      sh: player.神魄段数,
      mdz: player.魔道值,
      hgd: player.favorability,
      jczdl: power2,
      level: level,
      level2: level2,
      lingshi: lingshi,
      player_maxHP: player.血量上限,
      player_nowHP: player.当前血量,
      player_atk: kxjs[0],
      player_atk2: p[0],
      player_def: kxjs[1],
      player_def2: p[1],
      生命加成: kxjs[2],
      生命加成_t: p[2],
      防御加成: kxjs[3],
      防御加成_t: p[3],
      攻击加成: kxjs[4],
      攻击加成_t: p[4],
      player_bao: player.暴击率,
      player_bao2: player.暴击伤害,
      occupation: occupation,
      occupation_level: occupation_level_name,
      occupation_exp: occupation_exp,
      occupation_need_exp: occupation_need_exp,
      arms: equipment.武器,
      armor: equipment.护具,
      treasure: equipment.法宝,
      association: this_association,
      learned_gongfa: player.学习的功法,
      婚姻状况: hunyin,
      武器评级: 武器评级,
      护具评级: 护具评级,
      法宝评级: 法宝评级,
    };
    const data1 = await new Show(e).get_player_pindao_Data(player_data);
    return await puppeteer.screenshot('player_pindao', {
      ...data1,
    });
  } 
}
//返回战斗
export async function get_fight_img(e,data) {
  let get_data={fightmsg: data}
  const data1 = await new Show(e).get_fightData(get_data);
  return await puppeteer.screenshot('fight', {
    ...data1,
  });
}
/**
 * 我的宗门
 * @return image
 */
export async function get_association_img(e) {
  let item;
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  //无存档
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  //门派
  let player = data.getData('player', usr_qq);
  if (!isNotNull(player.宗门)) {
    return;
  }
  //境界
  //let now_level_id;
  if (!isNotNull(player.level_id)) {
    e.reply('请先#同步信息');
    return;
  }
  //有加入宗门
  let ass = data.getAssociation(player.宗门.宗门名称);
  //寻找
  let mainqq = await data.getData('player', ass.宗主);
  //仙宗
  let xian = ass.power;
  let weizhi;
  if (xian == 0) {
    weizhi = '凡界';
  } else {
    weizhi = '仙界';
  }
  //门槛
  let level = data.Level_list.find(
    item => item.level_id === ass.最低加入境界
  ).level;
  // 副宗主
  let fuzong = [];
  for (item in ass.副宗主) {
    fuzong[item] =
      '道号：' +
      data.getData('player', ass.副宗主[item]).名号 +
      'QQ：' +
      ass.副宗主[item];
  }
  //长老
  const zhanglao = [];
  for (item in ass.长老) {
    zhanglao[item] =
      '道号：' +
      data.getData('player', ass.长老[item]).名号 +
      'QQ：' +
      ass.长老[item];
  }
  //内门弟子
  const neimen = [];
  for (item in ass.内门弟子) {
    neimen[item] =
      '道号：' +
      data.getData('player', ass.内门弟子[item]).名号 +
      'QQ：' +
      ass.内门弟子[item];
  }
  //外门弟子
  const waimen = [];
  for (item in ass.外门弟子) {
    waimen[item] =
      '道号：' +
      data.getData('player', ass.外门弟子[item]).名号 +
      'QQ：' +
      ass.外门弟子[item];
  }
  let state = '需要维护';
  let now = new Date();
  let nowTime = now.getTime(); //获取当前日期的时间戳
  if (ass.维护时间 > nowTime - 1000 * 60 * 60 * 24 * 7) {
    state = '不需要维护';
  }
  //计算修炼效率
  let xiulian;
  let dongTan = await data.bless_list.find(item => item.name == ass.宗门驻地);
  if (ass.宗门驻地 == 0) {
    xiulian = ass.宗门等级 * 0.05 * 100;
  } else {
    try {
      xiulian = ass.宗门等级 * 0.05 * 100 + dongTan.efficiency * 100;
    } catch {
      xiulian = ass.宗门等级 * 0.05 * 100 + 0.5;
    }
  }
  xiulian = Math.trunc(xiulian);
  if (ass.宗门神兽 == 0) {
    ass.宗门神兽 = '无';
  }
  let association_data = {
    user_id: usr_qq,
    ass: ass,
    mainname: mainqq.名号,
    mainqq: ass.宗主,
    xiulian: xiulian,
    weizhi: weizhi,
    level: level,
    mdz: player.魔道值,
    zhanglao: zhanglao,
    fuzong: fuzong,
    neimen: neimen,
    waimen: waimen,
    state: state,
  };
  const data1 = await new Show(e).get_associationData(association_data);
  return await puppeteer.screenshot('association', {
    ...data1,
  });
}
export async function get_baoshi_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
  usr_qq= await channel(usr_qq)
  let player = await data.getData('player', usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  const bao = Math.trunc(parseInt(player.暴击率 * 100));
  let equipment = await data.getData('equipment', usr_qq);
  let player_data = {
    user_id: usr_qq,
    mdz: player.魔道值,
    nickname: player.名号,
    arms: equipment.武器,
    armor: equipment.护具,
    treasure: equipment.法宝,
    player_atk: player.攻击,
    player_def: player.防御,
    player_bao: bao,
    player_maxHP: player.血量上限,
    player_nowHP: player.当前血量,
    pifu: Number(player.装备皮肤),
  };
  const data1 = await new Show(e).get_equipmnetData3(player_data);
  return await puppeteer.screenshot('equipment3', {
    ...data1,
  });
}
/**
 * 返回该玩家的装备图片
 * @return image
 */
export async function get_equipment_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let player = await data.getData('player', usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  const bao = Math.trunc(parseInt(player.暴击率 * 100));
  let equipment = await data.getData('equipment', usr_qq);
  let player_data = {
    user_id: usr_qq,
    mdz: player.魔道值,
    nickname: player.名号,
    arms: equipment.武器,
    armor: equipment.护具,
    treasure: equipment.法宝,
    player_atk: player.攻击,
    player_def: player.防御,
    player_bao: bao,
    player_maxHP: player.血量上限,
    player_nowHP: player.当前血量,
    pifu: Number(player.装备皮肤),
  };
  const data1 = await new Show(e).get_equipmnetData(player_data);
  return await puppeteer.screenshot('equipment', {
    ...data1,
  });
}
/**
 * 返回该玩家的纳戒图片
 * @return image
 */
export async function get_najie_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let player = await data.getData('player', usr_qq);
  let najie = await Read_najie(usr_qq);
  const lingshi = Math.trunc(najie.灵石);
  const lingshi2 = Math.trunc(najie.灵石上限);
  let strand_hp = Strand(player.当前血量, player.血量上限);
  let strand_lingshi = Strand(najie.灵石, najie.灵石上限);
  let player_data = {
    user_id: usr_qq,
    player: player,
    najie: najie,
    mdz: player.魔道值,
    nickname: player.名号,
    najie_lv: najie.等级,
    player_maxHP: player.血量上限,
    player_nowHP: player.当前血量,
    najie_maxlingshi: lingshi2,
    najie_lingshi: lingshi,
    najie_equipment: najie.装备,
    najie_danyao: najie.丹药,
    najie_daoju: najie.道具,
    najie_gongfa: najie.功法,
    najie_caoyao: najie.草药,
    najie_cailiao: najie.材料,
    strand_hp: strand_hp,
    strand_lingshi: strand_lingshi,
    pifu: player.纳戒皮肤,
  };
  const data1 = await new Show(e).get_najieData(player_data);
  return await puppeteer.screenshot('najie', {
    ...data1,
  });
}


/**
 * 返回该玩家的纳戒图片
 * @return image
 */
export async function get_najie_chouchou_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let player = await data.getData('player', usr_qq);
  let najie = await Read_najie(usr_qq);
  const lingshi = Math.trunc(najie.灵石);
  const lingshi2 = Math.trunc(najie.灵石上限);
  let strand_hp = Strand(player.当前血量, player.血量上限);
  let strand_lingshi = Strand(najie.灵石, najie.灵石上限);

  // for(i in najie){
  //   for(var z=0;z<najie[i].length;z++){
  //     for(d in najie[i][z]){
  //       if(najie[i][z][d]==1){
  //         najie[i][z]
  //       }
  //     }
  //   }
  // }
  let wupin = [
    '装备',
    '丹药',
    '道具',
    '功法',
    '草药',
    '材料',
    '仙宠',
    '仙宠口粮',
  ];
  for (var i of wupin) {
    for (let l of najie[i]) {
      //纳戒中的数量
      if(l.islockd==1){
        console.log("执行1111111111111111111111111")
        let a=l.name
        let b=l.desc
        for(var z=0;z<najie[i].length;z++){
          if(najie[i][z].name==a && najie[i][z].desc==b){
            if(najie[i].length>1){
              najie[i].splice(z,1)
            }else{
              najie[i]=''

            }
            
          }
        }
      }
    }
  }


  let player_data = {
    user_id: usr_qq,
    player: player,
    najie: najie,
    mdz: player.魔道值,
    nickname: player.名号,
    najie_lv: najie.等级,
    player_maxHP: player.血量上限,
    player_nowHP: player.当前血量,
    najie_maxlingshi: lingshi2,
    najie_lingshi: lingshi,
    najie_equipment: najie.装备,
    najie_danyao: najie.丹药,
    najie_daoju: najie.道具,
    najie_gongfa: najie.功法,
    najie_caoyao: najie.草药,
    najie_cailiao: najie.材料,
    strand_hp: strand_hp,
    strand_lingshi: strand_lingshi,
    pifu: player.纳戒皮肤,
  };
  const data1 = await new Show(e).get_najie_chouchou_Data(player_data);
  return await puppeteer.screenshot('najie', {
    ...data1,
  });
}



/**
 * 返回境界列表图片
 * @return image
 */
export async function get_state_img(e, all_level) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let player = await data.getData('player', usr_qq);
  let Level_id = player.level_id;
  let Level_list = data.Level_list;
  //循环删除表信息
  if (!all_level) {
    for (let i = 1; i <= 60; i++) {
      if (i > Level_id - 6 && i < Level_id + 6) {
        continue;
      }
      Level_list = await Level_list.filter(item => item.level_id != i);
    }
  }
  let state_data = {
    user_id: usr_qq,
    Level_list: Level_list,
  };
  const data1 = await new Show(e).get_stateData(state_data);
  return await puppeteer.screenshot('state', {
    ...data1,
  });
}

export async function get_statezhiye_img(e, all_level) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let player = await data.getData('player', usr_qq);
  let Level_id = player.occupation_level;
  let Level_list = data.occupation_exp_list;
  //循环删除表信息
  if (!all_level) {
    for (let i = 0; i <= 60; i++) {
      if (i > Level_id - 6 && i < Level_id + 6) {
        continue;
      }
      Level_list = await Level_list.filter(item => item.id != i);
    }
  }
  let state_data = {
    user_id: usr_qq,
    Level_list: Level_list,
  };
  const data1 = await new Show(e).get_stateDatazhiye(state_data);
  return await puppeteer.screenshot('statezhiye', {
    ...data1,
  });
}

/**
 * 返回境界列表图片
 * @return image
 */
export async function get_statemax_img(e, all_level) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let player = await data.getData('player', usr_qq);
  let Level_id = player.Physique_id;
  let LevelMax_list = data.LevelMax_list;
  //循环删除表信息
  if (!all_level) {
    for (let i = 1; i <= 60; i++) {
      if (i > Level_id - 6 && i < Level_id + 6) {
        continue;
      }
      LevelMax_list = await LevelMax_list.filter(item => item.level_id != i);
    }
  }
  let statemax_data = {
    user_id: usr_qq,
    LevelMax_list: LevelMax_list,
  };
  const data1 = await new Show(e).get_statemaxData(statemax_data);
  return await puppeteer.screenshot('statemax', {
    ...data1,
  });
}

export async function get_talent_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let player = await data.getData('player', usr_qq);
  let Level_id = player.Physique_id;
  let talent_list = data.talent_list;
  let talent_data = {
    user_id: usr_qq,
    talent_list: talent_list,
  };
  const data1 = await new Show(e).get_talentData(talent_data);
  return await puppeteer.screenshot('talent', {
    ...data1,
  });
}

/**
 * 返回修仙设置
 * @return image
 */
export async function get_adminset_img(e) {
  const cf =config.getConfig('xiuxian', 'xiuxian')
  let adminset = {
    //CD：分
    CDassociation: cf.CD.association,
    CDjoinassociation: cf.CD.joinassociation,
    CDassociationbattle: cf.CD.associationbattle,
    CDrob: cf.CD.rob,
    CDgambling: cf.CD.gambling,
    CDcouple: cf.CD.couple,
    CDgarden: cf.CD.garden,
    CDlevel_up: cf.CD.level_up,
    CDsecretplace: cf.CD.secretplace,
    CDtimeplace: cf.CD.timeplace,
    CDforbiddenarea: cf.CD.forbiddenarea,
    CDreborn: cf.CD.reborn,
    CDtransfer: cf.CD.transfer,
    CDhonbao: cf.CD.honbao,
    CDboss: cf.CD.boss,
    //手续费
    percentagecost: cf.percentage.cost,
    percentageMoneynumber: cf.percentage.Moneynumber,
    percentagepunishment: cf.percentage.punishment,
    //出千控制
    sizeMoney: cf.size.Money,
    //开关
    switchplay: cf.switch.play,
    switchMoneynumber: cf.switch.play,
    switchcouple: cf.switch.couple,
    switchXiuianplay_key: cf.switch.Xiuianplay_key,
    //倍率
    biguansize: cf.biguan.size,
    biguantime: cf.biguan.time,
    biguancycle: cf.biguan.cycle,
    //
    worksize: cf.work.size,
    worktime: cf.work.time,
    workcycle: cf.work.cycle,

    //出金倍率
    SecretPlaceone: cf.SecretPlace.one,
    SecretPlacetwo: cf.SecretPlace.two,
    SecretPlacethree: cf.SecretPlace.three,
  };
  const data1 = await new Show(e).get_adminsetData(adminset);
  return await puppeteer.screenshot('adminset', {
    ...data1,
  });
}

export async function get_ranking_power_img(e, Data, usr_paiming, thisplayer) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let level = data.Level_list.find(
    item => item.level_id == thisplayer.level_id
  ).level;
  let ranking_power_data = {
    user_id: usr_qq,
    mdz: thisplayer.魔道值,
    nickname: thisplayer.名号,
    exp: thisplayer.修为,
    level: level,
    usr_paiming: usr_paiming,
    allplayer: Data,
  };
  const data1 = await new Show(e).get_ranking_powerData(ranking_power_data);
  return await puppeteer.screenshot('ranking_power', {
    ...data1,
  });
}

export async function get_ranking_money_img(
  e,
  Data,
  usr_paiming,
  thisplayer,
  thisnajie
) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  const najie_lingshi = Math.trunc(thisnajie.灵石);
  const lingshi = Math.trunc(thisplayer.灵石 + thisnajie.灵石);
  let ranking_money_data = {
    user_id: usr_qq,
    nickname: thisplayer.名号,
    lingshi: lingshi,
    najie_lingshi: najie_lingshi,
    usr_paiming: usr_paiming,
    allplayer: Data,
  };
  const data1 = await new Show(e).get_ranking_moneyData(ranking_money_data);
  return await puppeteer.screenshot('ranking_money', {
    ...data1,
  });
}
export async function fixed(usr_qq) {
  fs.copyFileSync(
    `${__PATH.auto_backup}/najie/${usr_qq}.json`,
    `${__PATH.najie_path}/${usr_qq}.json`
  );
  return;
}
/**
 * 返回柠檬堂
 * @return image
 */
export async function get_ningmenghome_img(e, thing_type) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let commodities_list = data.commodities_list;
  if (thing_type != '') {
    if (
      thing_type == '装备' ||
      thing_type == '丹药' ||
      thing_type == '功法' ||
      thing_type == '道具' ||
      thing_type == '草药'
    ) {
      commodities_list = commodities_list.filter(
        item => item.class == thing_type
      );
    } else if (
      thing_type == '武器' ||
      thing_type == '护具' ||
      thing_type == '法宝' ||
      thing_type == '修为' ||
      thing_type == '血量' ||
      thing_type == '血气' ||
      thing_type == '天赋'
    ) {
      commodities_list = commodities_list.filter(
        item => item.type == thing_type
      );
    }
  }
  let ningmenghome_data = {
    user_id: usr_qq,
    commodities_list: commodities_list,
  };
  const data1 = await new Show(e).get_ningmenghomeData(ningmenghome_data);
  let img = await puppeteer.screenshot('ningmenghome', {
    ...data1,
  });
  return img;
}
/**
 * 返回万宝楼
 * @return image
 */
export async function get_valuables_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let valuables_data = {
    user_id: usr_qq,
  };
  const data1 = await new Show(e).get_valuablesData(valuables_data);
  let img = await puppeteer.screenshot('valuables', {
    ...data1,
  });
  return img;
}
/**
 * @description: 进度条渲染
 * @param {Number} res 百分比小数
 * @return {*} css样式
 */
function Strand(now, max) {
  let num = ((now / max) * 100).toFixed(0);
  let mini;
  if (num > 100) {
    mini = 100;
  } else {
    mini = num;
  }
  let strand = {
    style: `style=width:${mini}%`,
    num: num,
  };
  return strand;
}

/**
 * 大数字转换，将大额数字转换为万、千万、亿等
 * @param value 数字值
 */
export function bigNumberTransform(value) {
  const newValue = ['', '', ''];
  let fr = 1000;
  let num = 3;
  let text1 = '';
  let fm = 1;
  while (value / fr >= 1) {
    fr *= 10;
    num += 1;
    // console.log('数字', value / fr, 'num:', num)
  }
  if (num <= 4) {
    // 千
    newValue[0] = parseInt(value / 1000) + '';
    newValue[1] = '千';
  } else if (num <= 8) {
    // 万
    text1 = parseInt(num - 4) / 3 > 1 ? '千万' : '万';
    // tslint:disable-next-line:no-shadowed-variable
    fm = text1 === '万' ? 10000 : 10000000;
    if (value % fm === 0) {
      newValue[0] = parseInt(value / fm) + '';
    } else {
      newValue[0] = parseFloat(value / fm).toFixed(2) + '';
    }
    newValue[1] = text1;
  } else if (num <= 16) {
    // 亿
    text1 = (num - 8) / 3 > 1 ? '千亿' : '亿';
    text1 = (num - 8) / 4 > 1 ? '万亿' : text1;
    text1 = (num - 8) / 7 > 1 ? '千万亿' : text1;
    // tslint:disable-next-line:no-shadowed-variable
    fm = 1;
    if (text1 === '亿') {
      fm = 100000000;
    } else if (text1 === '千亿') {
      fm = 100000000000;
    } else if (text1 === '万亿') {
      fm = 1000000000000;
    } else if (text1 === '千万亿') {
      fm = 1000000000000000;
    }
    if (value % fm === 0) {
      newValue[0] = parseInt(value / fm) + '';
    } else {
      newValue[0] = parseFloat(value / fm).toFixed(2) + '';
    }
    newValue[1] = text1;
  }
  if (value < 1000) {
    newValue[0] = value + '';
    newValue[1] = '';
  }
  return newValue.join('');
}
//读Boss表
export async function Read_Boss_List() {
  let dir = path.join(`${__PATH.Exchange}/Boss_list.json`);
  let Boss_list = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  Boss_list = JSON.parse(Boss_list);
  return Boss_list;
}

//写Boss表
export async function Write_Boss_List(wupin) {
  let dir = path.join(__PATH.Exchange, `Boss_list.json`);
  let new_ARR = JSON.stringify(wupin, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return;
}
  /**
   *从输入字符串中截取数字存入数组arr
   */
   export async function getNumversFromString(str) {
    var pattern = /\d+/g;//正则表达
    var matches = str.match(pattern);//匹配
    var arr = [];
    if (matches !== null) {
      for (var i = 0; i < matches.length; i++) {
        arr[i] = parseInt(matches[i], 10);
        //arr.push(parseInt(matches[i],10));
      }
    } else {
      arr[0] = 1;
      return arr;
    }
    return arr;
  }
/**
 * 计算战力
 */
export function GetPower(atk, def, hp, bao) {
  let power = (atk + def * 0.8 + hp * 0.6) * (bao + 1);
  power = parseInt(power);
  return power;
}
/**
 * 增加减少纳戒内物品
 * @param usr_qq 操作存档的qq号
 * @param thing_name  仙宠名称
 * @param n  操作的数量,取+增加,取 -减少
 * @param thing_level  仙宠等级
 * @returns 无
 */
export async function Add_仙宠(usr_qq, thing_name, n, thing_level = null) {
  var x = Number(n);
  if (x == 0) {
    return;
  }
  let najie = await Read_najie(usr_qq);
  let trr = najie.仙宠.find(
    item => item.name == thing_name && item.等级 == thing_level
  );
  var name = thing_name;
  if (x > 0 && !isNotNull(trr)) {
    //无中生有
    let newthing = data.xianchon.find(item => item.name == name);
    if (!isNotNull(newthing)) {
      console.log('没有这个东西');
      return;
    }
    if (thing_level != null) {
      newthing.等级 = thing_level;
    }
    najie.仙宠.push(newthing);
    najie.仙宠.find(
      item => item.name == name && item.等级 == newthing.等级
    ).数量 = x;
    let xianchon = najie.仙宠.find(
      item => item.name == name && item.等级 == newthing.等级
    );
    najie.仙宠.find(
      item => item.name == name && item.等级 == newthing.等级
    ).加成 = xianchon.等级 * xianchon.每级增加;
    najie.仙宠.find(
      item => item.name == name && item.等级 == newthing.等级
    ).islockd = 0;
    await Write_najie(usr_qq, najie);
    return;
  }
  najie.仙宠.find(item => item.name == name && item.等级 == trr.等级).数量 += x;
  if (
    najie.仙宠.find(item => item.name == name && item.等级 == trr.等级).数量 < 1
  ) {
    //假如用完了,需要删掉数组中的元素,用.filter()把!=该元素的过滤出来
    najie.仙宠 = najie.仙宠.filter(
      item => item.name != thing_name || item.等级 != trr.等级
    );
  }
  await Write_najie(usr_qq, najie);
  return;
}
export async function get_danfang_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }

  let danfang_list = data.danfang_list;

  let danfang_data = {
    user_id: usr_qq,
    danfang_list: danfang_list,
  };
  const data1 = await new Show(e).get_danfangData(danfang_data);
  let img = await puppeteer.screenshot('danfang', {
    ...data1,
  });
  return img;
}

export async function get_tuzhi_img(e, all_level) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }

  let tuzhi_list = data.tuzhi_list;

  let tuzhi_data = {
    user_id: usr_qq,
    tuzhi_list: tuzhi_list,
  };
  const data1 = await new Show(e).get_tuzhiData(tuzhi_data);
  let img = await puppeteer.screenshot('tuzhi', {
    ...data1,
  });
  return img;
}
//图开关
export async function setu(e) {
  e.reply(
    `玩命加载图片中,请稍后...   ` +
      '\n(一分钟后还没有出图片,大概率被夹了,这个功能谨慎使用,机器人容易寄)'
  );
  let url;
  //setu接口地址
  url = 'https://api.lolicon.app/setu/v2?proxy=i.pixiv.re&r18=0';
  let msg = [];
  let res;
  //
  try {
    let response = await fetch(url);
    res = await response.json();
  } catch (error) {
    console.log('Request Failed', error);
  }
  if (res !== '{}') {
    console.log('res不为空');
  } else {
    console.log('res为空');
  }
  let link = res.data[0].urls.original; //获取图链
  link = link.replace('pixiv.cat', 'pixiv.re'); //链接改为国内可访问的域名
  let pid = res.data[0].pid; //获取图片ID
  let uid = res.data[0].uid; //获取画师ID
  let title = res.data[0].title; //获取图片名称
  let author = res.data[0].author; //获取画师名称
  let px = res.data[0].width + '*' + res.data[0].height; //获取图片宽高
  msg.push(
    'User: ' +
      author +
      '\nUid: ' +
      uid +
      '\nTitle: ' +
      title +
      '\nPid: ' +
      pid +
      '\nPx: ' +
      px +
      '\nLink: ' +
      link
  );
  await sleep(1000);
  //最后回复消息
  e.reply(segment.image(link));
  //
  await ForwardMsg(e, msg);
  //返回true 阻挡消息不再往下
  return true;
}

//改变数据格式
export async function datachange(data) {
  if (data / 1000000000000 > 1) {
    return Math.floor((data * 100) / 1000000000000) / 100 + '万亿';
  } else if (data / 100000000 > 1) {
    return Math.floor((data * 100) / 100000000) / 100 + '亿';
  } else if (data / 10000 > 1) {
    return Math.floor((data * 100) / 10000) / 100 + '万';
  } else {
    return data;
  }
}
//写入纳戒信息,第二个参数是一个JavaScript对象
export async function Write_najie(usr_qq, najie) {
  let dir = path.join(__PATH.najie_path, `${usr_qq}.json`);
  let new_ARR = JSON.stringify(najie, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return;
}

//修为数量和灵石数量正增加,负减少
//使用时记得加await
export async function Add_灵石(usr_qq, 灵石数量 = 0) {
  let player = await Read_player(usr_qq);
  player.灵石 += Math.trunc(灵石数量);
  await Write_player(usr_qq, player);
  return;
}

export async function Add_修为(usr_qq, 修为数量 = 0) {
  let player = await Read_player(usr_qq);
  player.修为 += Math.trunc(修为数量);
  await Write_player(usr_qq, player);
  return;
}
export async function Add_魔道值(usr_qq, 魔道值 = 0) {
  let player = await Read_player(usr_qq);
  player.魔道值 += Math.trunc(魔道值);
  await Write_player(usr_qq, player);
  return;
}
export async function Add_血气(usr_qq, 血气 = 0) {
  let player = await Read_player(usr_qq);
  player.血气 += Math.trunc(血气);
  await Write_player(usr_qq, player);
  return;
}


export async function Add_热量(usr_qq, 热量 = 0) {
    let player = await Read_player(usr_qq);
	if (!isNotNull(player.热量)) {
		player.热量 = Math.trunc(热量);
		await Write_player(usr_qq, player);
		return;
	}
	if (isNotNull(player.热量)) {
		player.热量 += Math.trunc(热量);
        await Write_player(usr_qq, player);
        return;
    }
}

export async function Add_饱食度(usr_qq, 饱食度 = 0) {
    let player = await Read_player(usr_qq);
	if (!isNotNull(player.饱食度)) {
		player.饱食度 = Math.trunc(饱食度);
		await Write_player(usr_qq, player);
		return;
	}
	if (isNotNull(player.饱食度)) {
		player.饱食度 += Math.trunc(饱食度);
        await Write_player(usr_qq, player);
        return;
    }
}



export async function Add_HP(usr_qq, blood = 0) {
  let player = await Read_player(usr_qq);
  player.当前血量 += Math.trunc(blood);
  if (player.当前血量 > player.血量上限) {
    player.当前血量 = player.血量上限;
  }
  if (player.当前血量 < 0) {
    player.当前血量 = 0;
  }
  await Write_player(usr_qq, player);
  return;
}
/**
 *
 * @param {*} usr_qq 用户qq
 * @param {*} exp 经验值
 * @returns
 */
export async function Add_职业经验(usr_qq, exp = 0) {
  let player = await Read_player(usr_qq);

  if (exp == 0) {
    return;
  }
  exp = player.occupation_exp + exp;
  let level = player.occupation_level;
  while (true) {
    if(level>36){
      break
    }
    let need_exp = data.occupation_exp_list.find(item => item.id == level).experience;

    if (need_exp > exp) {
      break;
    } else {
      exp -= need_exp;
      level++;
    }
  }
  player.occupation_exp = exp;
  player.occupation_level = level;
  await Write_player(usr_qq, player);
  return;
}

export async function Add_najie_灵石(usr_qq, lingshi) {
  let najie = await Read_najie(usr_qq);
  najie.灵石 += Math.trunc(lingshi);
  await Write_najie(usr_qq, najie);
  return;
}

export async function Add_player_学习功法(usr_qq, gongfa_name) {
  let player = await Read_player(usr_qq);
  player.学习的功法.push(gongfa_name);
  data.setData('player', usr_qq, player);
  await player_efficiency(usr_qq);
  return;
}

export async function Reduse_player_学习功法(usr_qq, gongfa_name) {
  let player = await Read_player(usr_qq);
  Array.prototype.remove = function (v) {
    for (let i = 0, j = 0; i < this.length; i++) {
      if (this[i] != v) {
        this[j++] = this[i];
      }
    }
    this.length -= 1;
  };
  player.学习的功法.remove(gongfa_name);
  data.setData('player', usr_qq, player);
  await player_efficiency(usr_qq);
  return;
}

//---------------------------------------------分界线------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//修炼效率综合
export async function player_efficiency(usr_qq) {
  //这里有问题
  let player = await data.getData('player', usr_qq); //修仙个人信息
  let ass;
  let Assoc_efficiency; //宗门效率加成
  let linggen_efficiency; //灵根效率加成
  let gongfa_efficiency = 0; //功法效率加成
  let xianchong_efficiency = 0; // 仙宠效率加成
  if (!isNotNull(player.宗门)) {
    //是否存在宗门信息
    Assoc_efficiency = 0; //不存在，宗门效率为0
  } else {
    ass = await data.getAssociation(player.宗门.宗门名称); //修仙对应宗门信息
    if (ass.宗门驻地 == 0) {
      Assoc_efficiency = ass.宗门等级 * 0.05;
    } else {
      let dongTan = await data.bless_list.find(
        item => item.name == ass.宗门驻地
      );
      try {
        Assoc_efficiency = ass.宗门等级 * 0.05 + dongTan.efficiency;
      } catch {
        Assoc_efficiency = ass.宗门等级 * 0.05 + 0.5;
      }
    }
  }
  linggen_efficiency = player.灵根.eff; //灵根修炼速率
  label1: for (let i in player.学习的功法) {
    //存在功法，遍历功法加成
    let gongfa = ['gongfa_list', 'timegongfa_list'];
    //这里是查看了功法表
    for (let j of gongfa) {
      let ifexist = data[j].find(item => item.name == player.学习的功法[i]);
      if (ifexist) {
        gongfa_efficiency += ifexist.修炼加成;
        continue label1;
      }
    }
    player.学习的功法.splice(i, 1);
  }
  if (player.仙宠.type == '修炼') {
    // 是否存在修炼仙宠
    xianchong_efficiency = player.仙宠.加成; // 存在修炼仙宠，仙宠效率为仙宠效率加成
  }
  let dy = await Read_danyao(usr_qq);
  let bgdan = dy.biguanxl;
  if (parseInt(player.修炼效率提升) != parseInt(player.修炼效率提升)) {
    player.修炼效率提升 = 0;
  }

  player.修炼效率提升 =
    linggen_efficiency +
    Assoc_efficiency +
    gongfa_efficiency +
    xianchong_efficiency +
    bgdan; //修炼效率综合
  data.setData('player', usr_qq, player);
  return;
}
/**
 *
 * @param {*} usr_qq 玩家qq
 * @param {*} thing_name 物品名
 * @param {*} thing_class 物品类别
 * @param {*} thing_pinji 可选参数，装备品阶，数字0-6等
 * @returns 物品数量或者false
 */

//修改纳戒物品锁定状态
export async function re_najie_thing(
  usr_qq,
  thing_name,
  thing_class,
  thing_pinji,
  lock
) {
  let najie = await Read_najie(usr_qq);
  if (thing_class == '装备' && (thing_pinji || thing_pinji == 0)) {
    for (let i of najie['装备']) {
      if (i.name == thing_name && i.pinji == thing_pinji) i.islockd = lock;
    }
  } else {
    for (let i of najie[thing_class]) {
      if (i.name == thing_name) i.islockd = lock;
    }
  }
  await Write_najie(usr_qq, najie);
  return true;
}

//检查纳戒内物品是否存在
//判断物品
//要用await
export async function exist_najie_thing(
  usr_qq,
  thing_name,
  thing_class,
  thing_pinji
) {
  let najie = await Read_najie(usr_qq);
  let ifexist;
  if (thing_class == '装备' && (thing_pinji || thing_pinji == 0)) {
    ifexist = najie.装备.find(
      item => item.name == thing_name && item.pinji == thing_pinji
    );
  } else {
    let type = [
      '宝石',
      '装备',
      '丹药',
      '道具',
      '功法',
      '草药',
      '材料',
      '仙宠',
      '仙宠口粮',
	     '食材'
    ];

    
    for (let i of type) {
      if(!isNotNull(najie[i])){
        najie[i]=[]
        await Write_najie(usr_qq, najie)
      }
      ifexist = najie[i].find(item => item.name == thing_name);
      if (ifexist) break;
    }
  }
  if (ifexist) {
    return ifexist.数量;
  }
  return false;
}
/**
 *
 * @param {*} usr_qq 用户qq
 * @param {*} thing_name 物品名
 * @param {*} thing_class 物品类别
 * @param {*} thing_pinji 品级 数字0-6
 * @returns
 */

/**
 * 增加减少纳戒内物品
 * @param usr_qq 操作存档的qq号
 * @param name  物品名称
 * @param thing_class  物品类别
 * @param x  操作的数量,取+增加,取 -减少
 * @param pinji 品级 数字0-6
 * @returns 无
 */
export async function Add_najie_thing(usr_qq, name, thing_class, x, pinji) {

  if(x>0){
  let wupin= await foundthing(name)
  if(wupin.稀有度>0){
      try{
        const allThing=await readall('传闻系统')
        const Time=Date.now();
        const newThing={
            uid:usr_qq,
            name:name,
            num:x,
            Time:Time,
            稀有度:wupin.稀有度
        }
        allThing.push(newThing)
        await dataall(allThing,'传闻系统')
      }
      catch{
        const Time=Date.now();
        const newThing={
          uid:usr_qq,
          name:name,
          num:x,
          Time:Time,
          稀有度:wupin.稀有度
      }
       await dataall([newThing],'传闻系统')
      }
    }
  }
  if (x == 0) return;
  let najie = await Read_najie(usr_qq);
  //写入
  //这部分写得很冗余,但能跑
  if (thing_class == '装备') {
    if (!pinji && pinji != 0) {
      pinji = Math.trunc(Math.random() * 6);
    }
    let z = [0.8, 1, 1.1, 1.2, 1.3, 1.5, 2];
    if (x > 0) {
      if (typeof name != 'object') {
        let list = [
          'equipment_list',
          'timeequipmen_list',
          'duanzhaowuqi',
          'duanzhaohuju',
          'duanzhaobaowu',
          'namegive',
        ];
        for (let i of list) {
          let thing = data[i].find(item => item.name == name);
          if (thing) {
            let equ = JSON.parse(JSON.stringify(thing));
            equ.pinji = pinji;
            equ.atk *= z[pinji];
            equ.def *= z[pinji];
            equ.HP *= z[pinji];
            equ.数量 = x;
            equ.islockd = 0;
            najie[thing_class].push(equ);
            await Write_najie(usr_qq, najie);
            return;
          }
        }
      } else {
        if (!name.pinji) name.pinji = pinji;
        name.数量 = x;
        name.islockd = 0;
        najie[thing_class].push(name);
        await Write_najie(usr_qq, najie);
        return;
      }
    }
    if (typeof name != 'object') {
      najie[thing_class].find(
        item => item.name == name && item.pinji == pinji
      ).数量 += x;
    } else {
      najie[thing_class].find(
        item => item.name == name.name && item.pinji == pinji
      ).数量 += x;
    }
    najie.装备 = najie.装备.filter(item => item.数量 > 0);
    await Write_najie(usr_qq, najie);
    return;
  } else if (thing_class == '仙宠') {
    if (x > 0) {
      if (typeof name != 'object') {
        let thing = data.xianchon.find(item => item.name == name);
        if (thing) {
          thing = JSON.parse(JSON.stringify(thing));
          thing.数量 = x;
          thing.islockd = 0;
          najie[thing_class].push(thing);
          await Write_najie(usr_qq, najie);
          return;
        }
      } else {
        name.数量 = x;
        name.islockd = 0;
        najie[thing_class].push(name);
        await Write_najie(usr_qq, najie);
        return;
      }
    }
    if (typeof name != 'object') {
      najie[thing_class].find(item => item.name == name).数量 += x;
    } else {
      najie[thing_class].find(item => item.name == name.name).数量 += x;
    }
    najie.仙宠 = najie.仙宠.filter(item => item.数量 > 0);
    await Write_najie(usr_qq, najie);
    return;
  }else  if (thing_class == '宝石')
    if (x > 0) {
      if (typeof name != 'object') {
        let list = [
          'baoshi_list',
        ];
        for (let i of list) {
          let thing = data[i].find(item => item.name == name);
          if (thing) {
            let equ = JSON.parse(JSON.stringify(thing));
            equ.数量 = x;
            equ.islockd = 0;
            najie[thing_class].push(equ);
            await Write_najie(usr_qq, najie);
            return;
          }
        }
      } else {
        name.数量 = x;
        name.islockd = 0;
        najie[thing_class].push(name);
        await Write_najie(usr_qq, najie);
        return;
      }
  }
  let exist = await exist_najie_thing(usr_qq, name, thing_class);
  if (x > 0 && !exist) {
    let thing;
    let list = [
      'danyao_list',
      'newdanyao_list',
      'timedanyao_list',
      'daoju_list',
      'gongfa_list',
      'timegongfa_list',
      'caoyao_list',
      'xianchonkouliang',
      'duanzhaocailiao',
      'kamian',
      'kamian3',
	  // 'cailiao_list',
	  // 'shicai_list',
    'baoshi_list'
    ];
    for (let i of list) {
      thing = data[i].find(item => item.name == name);
      if (thing) {
        najie[thing_class].push(thing);
        najie[thing_class].find(item => item.name == name).数量 = x;
        najie[thing_class].find(item => item.name == name).islockd = 0;
        await Write_najie(usr_qq, najie);
        return;
      }
    }
  }
  najie[thing_class].find(item => item.name == name).数量 += x;
  najie[thing_class] = najie[thing_class].filter(item => item.数量 > 0);
  await Write_najie(usr_qq, najie);
  return;
}

//替换装备
export async function instead_equipment(usr_qq, equipment_data) {
  //装备name
  await Add_najie_thing(
    usr_qq,
    equipment_data,
    '装备',
    -1,
    equipment_data.pinji
  );
  let equipment = await Read_equipment(usr_qq);
  if (equipment_data.type == '武器') {
    //把读取装备，把武器放回戒指
    await Add_najie_thing(
      usr_qq,
      equipment.武器,
      '装备',
      1,
      equipment.武器.pinji
    );
    //根据名字找武器
    equipment.武器 = equipment_data;
    //武器写入装备
    await Write_equipment(usr_qq, equipment);
    return;
  }
  if (equipment_data.type == '护具') {
    await Add_najie_thing(
      usr_qq,
      equipment.护具,
      '装备',
      1,
      equipment.护具.pinji
    );
    equipment.护具 = equipment_data;
    await Write_equipment(usr_qq, equipment);
    return;
  }
  if (equipment_data.type == '法宝') {
    await Add_najie_thing(
      usr_qq,
      equipment.法宝,
      '装备',
      1,
      equipment.法宝.pinji
    );
    equipment.法宝 = equipment_data;
    await Write_equipment(usr_qq, equipment);
    return;
  }
  return;
}
export async function dujie(user_qq) {
  let usr_qq = user_qq;
  let player = await Read_player(usr_qq);
  //根据当前血量才算
  //计算系数
  var new_blood = player.当前血量;
  var new_defense = player.防御;
  var new_attack = player.攻击;
  //渡劫期基础血量为1600000。防御800000，攻击800000
  new_blood = new_blood / 100000;
  new_defense = new_defense / 100000;
  new_attack = new_attack / 100000;
  //取值比例4.6.2
  new_blood = (new_blood * 4) / 10;
  new_defense = (new_defense * 6) / 10;
  new_attack = (new_attack * 2) / 10;
  //基础厚度
  var N = new_blood + new_defense;
  //你的系数
  var x = N * new_attack;
  //系数只取到后两位
  //灵根加成
  if (player.灵根.type == '真灵根') {
    x = x * (1 + 0.5);
  } else if (player.灵根.type == '天灵根') {
    x = x * (1 + 0.75);
  } else {
    x = x * (1 + 1);
  }
  x = x.toFixed(2);
  return x;
}
//发送转发消息
//输入data一个数组,元素是字符串,每一个元素都是一条消息.
export async function ForwardMsg(e, data) {
//  let msgList = [];
//  for (let i of data) {
//    msgList.push({
//      message: i,
//      nickname: Bot.nickname,
//      user_id: Bot.uin,
//    });
//  }
//  if (msgList.length == 1) {
//    await e.reply(msgList[0].message);
//  } else {
//    await e.reply(await Bot.makeForwardMsg(msgList));
//  }
let img = await get_fight_img(e,data)
e.reply(img)
  return;
}


//对象数组排序
export function sortBy(field) {
  //从大到小,b和a反一下就是从小到大
  return function (b, a) {
    return a[field] - b[field];
  };
}

//获取总修为
export async function Get_xiuwei(usr_qq) {
  let player = await Read_player(usr_qq);
  let sum_exp = 0;
  let now_level_id;
  if (!isNotNull(player.level_id)) {
    return;
  }
  now_level_id = data.Level_list.find(
    item => item.level_id == player.level_id
  ).level_id;
  if (now_level_id < 65) {
    for (var i = 1; i < now_level_id; i++) {
      sum_exp = sum_exp + data.Level_list.find(temp => temp.level_id == i).exp;
    }
  } else {
    sum_exp = -999999999;
  } //说明玩家境界有错误
  sum_exp += player.修为;
  return sum_exp;
}

//获取随机灵根
export async function get_random_talent() {
  let talent;
  if (get_random_res(体质概率)) {
    talent = data.talent_list.filter(item => item.type == '体质');
  } else if (get_random_res(伪灵根概率 / (1 - 体质概率))) {
    talent = data.talent_list.filter(item => item.type == '伪灵根');
  } else if (get_random_res(真灵根概率 / (1 - 伪灵根概率 - 体质概率))) {
    talent = data.talent_list.filter(item => item.type == '真灵根');
  } else if (
    get_random_res(天灵根概率 / (1 - 真灵根概率 - 伪灵根概率 - 体质概率))
  ) {
    talent = data.talent_list.filter(item => item.type == '天灵根');
  } else if (
    get_random_res(
      圣体概率 / (1 - 真灵根概率 - 伪灵根概率 - 体质概率 - 天灵根概率)
    )
  ) {
    talent = data.talent_list.filter(item => item.type == '圣体');
  } else {
    talent = data.talent_list.filter(item => item.type == '变异灵根');
  }
  let newtalent = get_random_fromARR(talent);
  return newtalent;
}

/**
 * 输入概率随机返回布尔类型数据
 * @param P 概率
 * @returns 随机返回 false or true
 */
export function get_random_res(P) {
  if (P > 1) {
    P = 1;
  }
  if (P < 0) {
    P = 0;
  }
  let rand = Math.random();
  if (rand < P) {
    return true;
  }
  return false;
}

/**
 * 输入数组随机返回其中一个
 * @param ARR 输入的数组
 * @returns 随机返回一个元素
 */
export function get_random_fromARR(ARR) {
  //let L = ARR.length;
  let randindex = Math.trunc(Math.random() * ARR.length);
  return ARR[randindex];
}

//sleep
export async function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

// 时间转换
export function timestampToTime(timestamp) {
  //时间戳为10位需*1000，时间戳为13位的话不需乘1000
  var date = new Date(timestamp);
  var Y = date.getFullYear() + '-';
  var M =
    (date.getMonth() + 1 < 10
      ? '0' + (date.getMonth() + 1)
      : date.getMonth() + 1) + '-';
  var D = date.getDate() + ' ';
  var h = date.getHours() + ':';
  var m = date.getMinutes() + ':';
  var s = date.getSeconds();
  return Y + M + D + h + m + s;
}

//根据时间戳获取年月日时分秒
export async function shijianc(time) {
  let dateobj = {};
  var date = new Date(time);
  dateobj.Y = date.getFullYear();
  dateobj.M = date.getMonth() + 1;
  dateobj.D = date.getDate();
  dateobj.h = date.getHours();
  dateobj.m = date.getMinutes();
  dateobj.s = date.getSeconds();
  return dateobj;
}

//获取上次签到时间
export async function getLastsign(usr_qq) {
  //查询redis中的人物动作
  let time = await redis.get('xiuxian:player:' + usr_qq + ':lastsign_time');
  if (time != null) {
    let data = await shijianc(parseInt(time));
    return data;
  }
  return false;
}
//获取上次周年庆签到时间
export async function getLastsign2(usr_qq) {
  //查询redis中的人物动作
  let time = await redis.get('xiuxian:player:' + usr_qq + ':lastsign_time2');
  if (time != null) {
    let data = await shijianc(parseInt(time));
    return data;
  }
  return false;
}
//获取当前人物状态
export async function getPlayerAction(usr_qq) {
  //查询redis中的人物动作
  let arr = {};
  let action = await redis.get('xiuxian:player:' + usr_qq + ':action');
  action = JSON.parse(action);
  //动作不为空闲
  if (action != null) {
    //人物有动作查询动作结束时间
    let action_end_time = action.end_time;
    let now_time = new Date().getTime();
    if (now_time <= action_end_time) {
      let m = parseInt((action_end_time - now_time) / 1000 / 60);
      let s = parseInt((action_end_time - now_time - m * 60 * 1000) / 1000);
      arr.action = action.action; //当期那动作
      arr.time = m + '分' + s + '秒'; //剩余时间
      return arr;
    }
  }
  arr.action = '空闲';
  return arr;
}

//锁定
export async function dataverification(e) {
  if (!e.isGroup) {
    //禁私聊
    return 1;
  }
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  if (usr_qq == 80000000) {
    //非匿名
    return 1;
  }
  let ifexistplay = await existplayer(usr_qq);
  if (!ifexistplay) {
    //无存档
    return 1; //假
  }
  //真
  return 0;
}

/**
 * 判断对象是否不为undefined且不为null
 * @param obj 对象
 * @returns
 */
export function isNotNull(obj) {
  if (obj == undefined || obj == null) return false;
  return true;
}

export function isNotBlank(value) {
  if (value ?? '' !== '') {
    return true;
  } else {
    return false;
  }
}

export async function Read_qinmidu() {
  let dir = path.join(`${__PATH.qinmidu}/qinmidu.json`);
  let qinmidu = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  qinmidu = JSON.parse(qinmidu);
  return qinmidu;
}

export async function Write_qinmidu(qinmidu) {
  let dir = path.join(__PATH.qinmidu, `qinmidu.json`);
  let new_ARR = JSON.stringify(qinmidu, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return;
}
export async function Read_channel() {
  let dir = path.join(`${__PATH.channel}/channel.json`);
  let channel = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  channel = JSON.parse(channel);
  return channel;
}

export async function Write_channel(channel) {
  let dir = path.join(__PATH.channel, `channel.json`);
  let new_ARR = JSON.stringify(channel, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return;
}
export async function fstadd_channel(A, B, key) {
  let channel;
  try {
    channel = await Read_channel();
  } catch {
    //没有表要先建立一个！
    await Write_channel([]);
    channel = await Read_channel();
  }
  let pd=false
  var i = A;
  var l=0;
      while(i >= 1){
      i=i/10;
      l++;
      }
  if(l>10){//判断是否为频道19位id
    pd=true
  }
  let player=''
  if(pd){
    player = {
      QQ_ID: B,
      频道_ID: A,
      密钥: key,
    };
  }else{
    player = {
    QQ_ID: A,
    频道_ID: B,
    密钥: key,
  };
  }
  if(player==''){
    console.log("出现错误!!!!:设置绑定请求出现错误")
    return
  }
  channel.push(player);
  await Write_channel(channel);
  return;
}
export async function fstadd_qinmidu(A, B) {
  let qinmidu;
  try {
    qinmidu = await Read_qinmidu();
  } catch {
    //没有表要先建立一个！
    await Write_qinmidu([]);
    qinmidu = await Read_qinmidu();
  }
  let player = {
    QQ_A: A,
    QQ_B: B,
    亲密度: 0,
    婚姻: 0,
  };
  qinmidu.push(player);
  await Write_qinmidu(qinmidu);
  return;
}

export async function add_qinmidu(A, B, qinmi) {
  let qinmidu;
  try {
    qinmidu = await Read_qinmidu();
  } catch {
    //没有表要先建立一个！
    await Write_qinmidu([]);
    qinmidu = await Read_qinmidu();
  }
  let i;
  for (i = 0; i < qinmidu.length; i++) {
    if (
      (qinmidu[i].QQ_A == A && qinmidu[i].QQ_B == B) ||
      (qinmidu[i].QQ_A == B && qinmidu[i].QQ_B == A)
    ) {
      break;
    }
  }
  if (i == qinmidu.length) {
    await fstadd_qinmidu(A, B);
    qinmidu = await Read_qinmidu();
  }
  qinmidu[i].亲密度 += qinmi;
  await Write_qinmidu(qinmidu);
  return;
}

export async function find_qinmidu(A, B) {
  let qinmidu;
  try {
    qinmidu = await Read_qinmidu();
  } catch {
    //没有建立一个
    await Write_qinmidu([]);
    qinmidu = await Read_qinmidu();
  }
  let i;
  let QQ = [];
  for (i = 0; i < qinmidu.length; i++) {
    if (qinmidu[i].QQ_A == A || qinmidu[i].QQ_A == B) {
      if (qinmidu[i].婚姻 != 0) {
        QQ.push = qinmidu[i].QQ_B;
        break;
      }
    } else if (qinmidu[i].QQ_B == A || qinmidu[i].QQ_B == B) {
      if (qinmidu[i].婚姻 != 0) {
        QQ.push = qinmidu[i].QQ_A;
        break;
      }
    }
  }
  for (i = 0; i < qinmidu.length; i++) {
    if (
      (qinmidu[i].QQ_A == A && qinmidu[i].QQ_B == B) ||
      (qinmidu[i].QQ_A == B && qinmidu[i].QQ_B == A)
    ) {
      break;
    }
  }
  if (i == qinmidu.length) {
    return false;
  } else if (QQ.length != 0) {
    return 0;
  } else {
    return qinmidu[i].亲密度;
  }
}
//查询A的婚姻，如果有婚姻则返回对方qq，若无则返回false
export async function exist_hunyin(A) {
  let qinmidu;
  try {
    qinmidu = await Read_qinmidu();
  } catch {
    //没有建立一个
    await Write_qinmidu([]);
    qinmidu = await Read_qinmidu();
  }
  let i = 0;
  let flag = 0;
  for (i = 0; i < qinmidu.length; i++) {
    if (qinmidu[i].QQ_A == A) {
      //已婚则将A/B的另一半存到QQ数组中
      if (qinmidu[i].婚姻 != 0) {
        flag = qinmidu[i].QQ_B;
        break;
      }
    } else if (qinmidu[i].QQ_B == A) {
      if (qinmidu[i].婚姻 != 0) {
        flag = qinmidu[i].QQ_A;
        break;
      }
    }
  }
  //A存在已婚则返回对方qq
  if (flag != 0) {
    //console.log(flag);
    return flag;
  } else {
    return false;
  }
}

export async function Write_shitu(shitu) {
  let dir = path.join(__PATH.shitu, `shitu.json`);
  let new_ARR = JSON.stringify(shitu, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return;
}
export async function Read_shitu() {
  let dir = path.join(`${__PATH.shitu}/shitu.json`);
  let shitu = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  shitu = JSON.parse(shitu);
  return shitu;
}

export async function fstadd_shitu(A) {
  let shitu;
  try {
    shitu = await Read_shitu();
  } catch {
    //没有表要先建立一个！
    await Write_shitu([]);
    shitu = await Read_shitu();
  }
  let player = {
    师傅: A,
    收徒: 0,
    未出师徒弟: 0,
    任务阶段: 0,
    renwu1: 0,
    renwu2: 0,
    renwu3: 0,
    师徒BOOS剩余血量: 100000000,
    已出师徒弟: [],
  };
  shitu.push(player);
  await Write_shitu(shitu);
  return;
}

export async function add_shitu(A, num) {
  let shitu;
  try {
    shitu = await Read_shitu();
  } catch {
    //没有表要先建立一个！
    await Write_shitu([]);
    shitu = await Read_shitu();
  }
  let i;
  for (i = 0; i < shitu.length; i++) {
    if (shitu[i].A == A) {
      break;
    }
  }
  if (i == shitu.length) {
    await fstadd_shitu(A);
    shitu = await Read_shitu();
  }
  shitu[i].收徒 += num;
  await Write_shitu(shitu);
  return;
}

export async function find_shitu(A) {
  let shitu;
  try {
    shitu = await Read_shitu();
  } catch {
    //没有建立一个
    await Write_shitu([]);
    shitu = await Read_shitu();
  }
  let i;
  let QQ = [];
  for (i = 0; i < shitu.length; i++) {
    if (shitu[i].师傅 == A) {
      break;
    }
  }
  if (i == shitu.length) {
    return false;
  } else if (QQ.length != 0) {
    return 0;
  } else {
    return shitu[i].师徒;
  }
}

export async function find_tudi(A) {
  let shitu;
  shitu = await Read_shitu();
  let i;
  let QQ = [];
  for (i = 0; i < shitu.length; i++) {
    if (shitu[i].未出师徒弟 == A) {
      break;
    }
  }
  if (i == shitu.length) {
    return 0;
  } else if (QQ.length != 0) {
    return 0;
  } else {
    return shitu[i].师徒;
  }
}
export async function Read_danyao(usr_qq) {
  let dir = path.join(`${__PATH.danyao_path}/${usr_qq}.json`);
  let danyao = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  danyao = JSON.parse(danyao);
  return danyao;
}

export async function Write_danyao(usr_qq, danyao) {
  let dir = path.join(__PATH.danyao_path, `${usr_qq}.json`);
  let new_ARR = JSON.stringify(danyao, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return;
}

export async function Read_temp() {
  let dir = path.join(`${__PATH.temp_path}/temp.json`);
  let temp = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  temp = JSON.parse(temp);
  return temp;
}

export async function Write_temp(temp) {
  let dir = path.join(__PATH.temp_path, `temp.json`);
  let new_ARR = JSON.stringify(temp, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return;
}
export async function Write_renwu(renwu) {
  let dir = path.join(__PATH.renwu, `renwu.json`);
  let new_ARR = JSON.stringify(renwu, "", "\t");
  fs.writeFileSync(dir, new_ARR, 'utf8', (err) => {
      console.log('写入成功', err)
  })
  return;
}
export async function Read_renwu() {
  let dir = path.join(`${__PATH.renwu}/renwu.json`);
  let renwu = fs.readFileSync(dir, 'utf8', (err, data) => {
      if (err) {
          console.log(err)
          return "error";
      }
      return data;
  })
  //将字符串数据转变成数组格式
  renwu = JSON.parse(renwu);
  return renwu;
}



export async function fstadd_renwu(A) {
  let renwu;
  try {
      renwu = await Read_renwu();
      ;
  } catch {
      //没有表要先建立一个！
      await Write_renwu([]);
      renwu = await Read_renwu();
  }
  let player = {
      player: A,
      等级: 0,
      经验: 0,
      renwu: 0,
      wancheng1: 0,
      jilu1: 0,
      wancheng2: 0,
      jilu2: 0,
      wancheng3: 0,
      jilu3: 0,
      jiequ: []

  }
  renwu.push(player);
  await Write_renwu(renwu);
  return;
}

export async function add_renwu(A, num) {
  let renwu;
  try {
      renwu = await Read_renwu();
      ;
  } catch {
      //没有表要先建立一个！
      await Write_renwu([]);
      renwu = await Read_renwu();
  }
  let i;
  for (i = 0; i < renwu.length; i++) {
      if (renwu[i].A == A) {
          break;
      }
  }
  if (i == renwu.length) {
      await fstadd_renwu(A);
      renwu = await Read_renwu();
  }
  renwu[i].等级 += num;
  await Write_renwu(renwu);
  return;
}

export async function find_renwu(A) {
  let renwu;
  try {
      renwu = await Read_renwu();
  } catch {
      //没有建立一个
      await Write_renwu([])
      renwu = await Read_renwu();
  }
  let i;
  let QQ = [];
  for (i = 0; i < renwu.length; i++) {
      if (renwu[i].player == A) {
          break;

      }
  }
  if (i == renwu.length) {
      return false;
  } else if (QQ.length != 0) {
      return 0;
  } else {
      return renwu[i].任务;
  }
}
/**
 * 常用查询合集
 */
export async function Go(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
  usr_qq= await channel(usr_qq)
  //不开放私聊
  if (!e.isGroup) {
    return 0;
  }
  //有无存档
  let ifexistplay = await existplayer(usr_qq);
  if (!ifexistplay) {
    return 0;
  }
  //获取游戏状态
  let game_action = await redis.get('xiuxian:player:' + usr_qq + ':game_action');
  //防止继续其他娱乐行为
  if (game_action == 0) {
    e.reply('修仙：游戏进行中...');
    return 0;
  }
  //查询redis中的人物动作
  let action = await redis.get('xiuxian:player:' + usr_qq + ':action');
  action = JSON.parse(action);
  if (action != null) {
    //人物有动作查询动作结束时间
    let action_end_time = action.end_time;
    let now_time = new Date().getTime();

    var i =usr_qq;
    var l=0;
        while(i >= 1){
        i=i/10;
        l++;
    }

    if (now_time <= action_end_time) {
      let m = parseInt((action_end_time - now_time) / 1000 / 60);
      let s = parseInt((action_end_time - now_time - m * 60 * 1000) / 1000);
      e.reply('正在' + action.action + '中,剩余时间:' + m + '分' + s + '秒');
      return 0;
    }


    // if(action.Place_action==0){
    //   action=action.toString()
    //   e.reply(`降临秘境${action.Place_address}已完成,等待结算中`)
    //   return 0;
    // }

    // if(action.Place_actionplus==0){
    //   action=action.toString()
    //   e.reply(`沉迷秘境${action.Place_address}x${action.cishu}次已完成,等待结算中`)
    //   return 0;
    // }
  }
  if (action != null) {
    if (null != action.start_time) {
     if ("镶嵌" === action.action) {
      let now_time = new Date().getTime();
    const need_time = 180000;
    const random = Math.random();
    const shi = action.Place_address;
    const player = await Read_player(usr_qq);
    let equipment = await Read_equipment(usr_qq);
    const time = now_time - action.start_time;
    const days = Math.floor(time / (1000 * 60 * 60 * 24));
    const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
  
    if (time <= need_time) {
      const m = Math.floor(time / 1000 / 60);
      const s = Math.floor((time - m * 60 * 1000) / 1000);
      e.reply(`正在镶嵌${action.Place_address.name}中，已过:${m}分${s}秒`);
      return;
    }
  
    async function embedGem(e, equipment, usr_qq, action, shi, equipmentType) {
      const gemSuccessRate = {
        低级宝石: 0.8,
        中级宝石: 0.5,
        高级宝石: 0.3
      };
  
      // 在这里定义 gemSlotMap 变量
      const gemSlotMap = {
        宝石位1: "宝石位1",
        宝石位2: "宝石位2",
        宝石位3: "宝石位3"
      };
  
      const gemSlot = gemSlotMap[action.wei]; // 将此行移动到正确的位置
      if (random < gemSuccessRate[action.Place_address.type]) {
        e.reply(`已成功镶嵌${action.Place_address.name}`);
        const equipmentType = action.thing.type;
        console.log("0"+equipment[equipmentType])
        console.log("0"+equipment)
        console.log("0"+equipment[0])
        console.log("0"+equipment["武器"])
        console.log("0"+equipment["武器"].name)
        console.log(equipmentType);
        if (equipment[equipmentType]?.宝石位?.hasOwnProperty(gemSlot)) {
          console.log("0"+equipment[equipmentType])
          equipment[equipmentType].宝石位[gemSlot] = action.Place_address;
          equipment[equipmentType].atk += shi.攻击加成;
          equipment[equipmentType].bao += shi.暴击加成;
          equipment[equipmentType].HP += shi.生命加成;
          console.log("1" + equipment[equipmentType].HP);
          console.log("2" + equipment[equipmentType].bao);
          console.log("3" + equipment[equipmentType].atk);
          console.log("4" + equipment[equipmentType].宝石位[gemSlot]);
          console.log("5" + action.Place_address.name);
          await Write_equipment(usr_qq, equipment);
        }
      } else {
        e.reply("手一滑，镶嵌失败");
      }
    }
  
    const gemTypes = ["低级宝石", "中级宝石", "高级宝石"];
    if (gemTypes.includes(action.type)) {
      const equipmentType = action.thing.type;
      await embedGem(e, equipment, usr_qq, action, shi, equipmentType);
      await Write_equipment(usr_qq, equipment);
    }
  
    await Write_equipment(usr_qq, equipment);
  
    await redis.del(`xiuxian:player:${usr_qq}:action`);
    return;
  }
}
  }




  return true;
}
// export async function Go(e) {
//   let usr_qq = e.user_id;
//   //不开放私聊
//   if (!e.isGroup) {
//     return 0;
//   }
//   //有无存档
//   let ifexistplay = await existplayer(usr_qq);
//   if (!ifexistplay) {
//     return 0;
//   }
//   //获取游戏状态
//   let game_action = await redis.get(
//     'xiuxian:player:' + usr_qq + ':game_action'
//   );
//   //防止继续其他娱乐行为
//   if (game_action == 0) {
//     e.reply('修仙：游戏进行中...');
//     return 0;
//   }
//   //查询redis中的人物动作
//   let action = await redis.get('xiuxian:player:' + usr_qq + ':action');
//   action = JSON.parse(action);
//   let now_time = new Date().getTime();
//   if (action != null) {
//     if("禁闭" == action.action){
//       if(null != action.start_time){
//         if(0 <= now_time - action.start_time- 3600000){
//           await redis.del('xiuxian:player:' + usr_qq + ':action');
//           e.reply("碎了一觉，跑出来了")
//           return true;
//         }
//       }else if(null != action.end_time){
//         if(0 <= now_time - action.end_time){
//           await redis.del('xiuxian:player:' + usr_qq + ':action');
//           e.reply("碎了一觉，跑出来了")
//           return true;
//         }
//       }
//     }
//     if(null != action.start_time){
//       let time = parseInt(now_time - action.start_time);
//       if("历练" == action.action){
//         let need_time = 360000;
//         let cishu = 1;
//         if(null != action.cishu){
//           cishu = action.cishu;
//           need_time = need_time * cishu;
//         }
//         if(need_time <= time){
//           await action_way_fun(e);
//           return true;
//         }
//       }
//       let days = parseInt(time / (1000 * 60 * 60 * 24));
//       let hours = parseInt((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//       let minutes = parseInt((time % (1000 * 60 * 60)) / (1000 * 60));
//       e.reply(action.action + days + " 天 " + hours + " 小时 " + minutes + " 分钟 ");
//       return 0;
//     }
//   }
//   return true;
// }


export async function Write_shop(shop) {
  let dir = path.join(__PATH.shop, `shop.json`);
  let new_ARR = JSON.stringify(shop, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return;
}

export async function Read_shop() {
  let dir = path.join(`${__PATH.shop}/shop.json`);
  let shop = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  shop = JSON.parse(shop);
  return shop;
}
//判断是否还有物品
export async function existshop(didian) {
  let shop = await Read_shop();
  let i;
  let thing = [];
  for (i = 0; i < shop.length; i++) {
    if (shop[i].name == didian) {
      break;
    }
  }
  for (var j = 0; j < shop[i].one.length; j++) {
    if (shop[i].one[j].数量 > 0) {
      thing.push(shop[i].one[j]);
    }
  }
  if (thing.length > 0) {
    return thing;
  } else {
    return false;
  }
}
export async function zd_battle(AA_player, BB_player) {
  let A_player = JSON.parse(JSON.stringify(BB_player));
  let B_player = JSON.parse(JSON.stringify(AA_player));
  let cnt = 0; //回合数
  let cnt2;
  let A_xue = 0; //最后要扣多少血
  let B_xue = 0;
  let t;
  let msg = [];
  let jineng1 = data.jineng1;
  let jineng2 = data.jineng2;
  //隐藏灵根
  let wuxing = ['金', '木', '土', '水', '火'];
  let type = ['武器', '护具', '法宝'];
  if (A_player.隐藏灵根 && A_player.id) {
    let buff = 1;
    let wx = [];
    let equ = await Read_equipment(A_player.id);
    for (let i of wuxing) if (A_player.隐藏灵根.name.includes(i)) wx.push(i);
    for (let i of type) {
      if (equ[i].id > 0 && equ[i].id < 6) buff += kezhi(equ[i].id, wx);
    }
    A_player.攻击 = Math.trunc(A_player.攻击 * buff);
    A_player.防御 = Math.trunc(A_player.防御 * buff);
    A_player.当前血量 = Math.trunc(A_player.当前血量 * buff);
    msg.push(
      `${A_player.名号}与装备产生了共鸣,自身全属性提高${Math.trunc(
        (buff - 1) * 100
      )}%`
    );
  }
  if (B_player.隐藏灵根 && B_player.id) {
    let wx = [];
    let buff = 1;
    let equ = await Read_equipment(B_player.id);
    for (let i of wuxing) if (B_player.隐藏灵根.name.includes(i)) wx.push(i);
    for (let i of type) {
      if (equ[i].id > 0 && equ[i].id < 6) buff += kezhi(equ[i].id, wx);
    }
    B_player.攻击 = Math.trunc(B_player.攻击 * buff);
    B_player.防御 = Math.trunc(B_player.防御 * buff);
    B_player.当前血量 = Math.trunc(B_player.当前血量 * buff);
    msg.push(
      `${B_player.名号}与装备产生了共鸣,自身全属性提高${Math.trunc(
        (buff - 1) * 100
      )}%`
    );
  }
  if (B_player.魔道值 > 999) {
    let buff = Math.trunc(B_player.魔道值 / 1000) / 100 + 1;
    if (buff > 1.3) buff = 1.3;
    if (B_player.灵根.name == '九重魔功') buff += 0.2;
    msg.push(
      '魔道值为' +
        B_player.名号 +
        '提供了' +
        Math.trunc((buff - 1) * 100) +
        '%的增伤'
    );
  } else if (
    B_player.魔道值 < 1 &&
    (B_player.灵根.type == '转生' || B_player.level_id > 41)
  ) {
    let buff = B_player.神石 * 0.0015;
    if (buff > 0.3) buff = 0.3;
    if (B_player.灵根.name == '九转轮回体') buff += 0.2;
    msg.push(
      '神石为' + B_player.名号 + '提供了' + Math.trunc(buff * 100) + '%的减伤'
    );
  }
  if (A_player.魔道值 > 999) {
    let buff = Math.trunc(A_player.魔道值 / 1000) / 100 + 1;
    if (buff > 1.3) buff = 1.3;
    if (A_player.灵根.name == '九重魔功') buff += 0.2;
    msg.push(
      '魔道值为' +
        A_player.名号 +
        '提供了' +
        Math.trunc((buff - 1) * 100) +
        '%的增伤'
    );
  } else if (
    A_player.魔道值 < 1 &&
    (A_player.灵根.type == '转生' || A_player.level_id > 41)
  ) {
    let buff = A_player.神石 * 0.0015;
    if (buff > 0.3) buff = 0.3;
    if (A_player.灵根.name == '九转轮回体') buff += 0.2;
    msg.push(
      '神石为' + A_player.名号 + '提供了' + Math.trunc(buff * 100) + '%的减伤'
    );
  }
  while (A_player.当前血量 > 0 && B_player.当前血量 > 0) {
    cnt2 = Math.trunc(cnt / 2);
    let Random = Math.random();
    let random = Math.random();
    let buff = 1;
    t = A_player;
    A_player = B_player;
    B_player = t;
    let baoji = baojishanghai(A_player.暴击率);
    //仙宠
    if (isNotNull(A_player.仙宠)) {
      if (A_player.仙宠.type == '暴伤') baoji += A_player.仙宠.加成;
      else if (A_player.仙宠.type == '战斗') {
        let ran = Math.random();
        if (ran < 0.35) {
          A_player.攻击 += Math.trunc(A_player.攻击 * A_player.仙宠.加成);
          A_player.防御 += Math.trunc(A_player.防御 * A_player.仙宠.加成);
          msg.push(
            '仙宠【' +
              A_player.仙宠.name +
              '】辅佐了[' +
              A_player.名号 +
              ']，使其伤害增加了[' +
              Math.trunc(A_player.仙宠.加成 * 100) +
              '%]'
          );
        }
      }
    }
    //武器
    if (isNotNull(A_player.id)) {
      let equipment = await Read_equipment(A_player.id);
      let ran = Math.random();
      if (equipment.武器.name == '紫云剑' && ran > 0.7) {
        A_player.攻击 *= 3;
        msg.push(`${A_player.名号}触发了紫云剑被动,攻击力提高了200%`);
      } else if (equipment.武器.name == '炼血竹枪' && ran > 0.75) {
        A_player.攻击 *= 2;
        A_player.当前血量 = Math.trunc(A_player.当前血量 * 1.2);
        msg.push(
          `${A_player.名号}触发了炼血竹枪被动,攻击力提高了100%,血量回复了20%`
        );
      } else if (equipment.武器.name == '少阴玉剑' && ran > 0.85) {
        A_player.当前血量 = Math.trunc(A_player.当前血量 * 1.4);
        msg.push(`${A_player.名号}触发了少阴玉剑被动,血量回复了40%`);
      }
    }
    let 伤害 = Harm(A_player.攻击 * 0.85, B_player.防御);
    let 法球伤害 = Math.trunc(A_player.攻击 * A_player.法球倍率);
    伤害 = Math.trunc(baoji * 伤害 + 法球伤害 + A_player.防御 * 0.1);
    //技能
    let count = 0; //限制次数
    for (var i = 0; i < jineng1.length; i++) {
      if (
        (jineng1[i].class == '常驻' &&
          (cnt2 == jineng1[i].cnt || jineng1[i].cnt == -1) &&
          Random < jineng1[i].pr) ||
        (A_player.学习的功法 &&
          jineng1[i].class == '功法' &&
          A_player.学习的功法.indexOf(jineng1[i].name) > -1 &&
          (cnt2 == jineng1[i].cnt || jineng1[i].cnt == -1) &&
          Random < jineng1[i].pr) ||
        (A_player.灵根 &&
          jineng1[i].class == '灵根' &&
          A_player.灵根.name == jineng1[i].name &&
          (cnt2 == jineng1[i].cnt || jineng1[i].cnt == -1) &&
          Random < jineng1[i].pr)
      ) {
        if (jineng1[i].msg2 == '') {
          msg.push(A_player.名号 + jineng1[i].msg1);
        } else {
          msg.push(
            A_player.名号 + jineng1[i].msg1 + B_player.名号 + jineng1[i].msg2
          );
        }
        伤害 = 伤害 * jineng1[i].beilv + jineng1[i].other;
        count++;
      }
      if (count == 3) break;
    }
    for (var i = 0; i < jineng2.length; i++) {
      if (
        (B_player.学习的功法 &&
          jineng2[i].class == '功法' &&
          B_player.学习的功法.indexOf(jineng2[i].name) > -1 &&
          (cnt2 == jineng2[i].cnt || jineng2[i].cnt == -1) &&
          random < jineng2[i].pr) ||
        (B_player.灵根 &&
          jineng2[i].class == '灵根' &&
          B_player.灵根.name == jineng2[i].name &&
          (cnt2 == jineng2[i].cnt || jineng2[i].cnt == -1) &&
          random < jineng2[i].pr)
      ) {
        if (jineng2[i].msg2 == '') {
          msg.push(B_player.名号 + jineng2[i].msg1);
        } else {
          msg.push(
            B_player.名号 + jineng2[i].msg1 + A_player.名号 + jineng2[i].msg2
          );
        }
        伤害 = 伤害 * jineng2[i].beilv + jineng2[i].other;
      }
    }
    if (A_player.魔道值 > 999) {
      buff += Math.trunc(A_player.魔道值 / 1000) / 100;
      if (buff > 1.3) buff = 1.3;
      if (A_player.灵根.name == '九重魔功') buff += 0.2;
    }
    if (
      B_player.魔道值 < 1 &&
      (B_player.灵根.type == '转生' || B_player.level_id > 41)
    ) {
      let buff2 = B_player.神石 * 0.0015;
      if (buff2 > 0.3) buff2 = 0.3;
      if (B_player.灵根.name == '九转轮回体') buff2 += 0.2;
      buff -= buff2;
    }
    伤害 = Math.trunc(伤害 * buff);
    B_player.当前血量 -= 伤害;
    if (B_player.当前血量 < 0) {
      B_player.当前血量 = 0;
    }
    if (cnt % 2 == 0) {
      A_player.防御 = AA_player.防御;
      A_player.攻击 = AA_player.攻击;
    } else {
      A_player.攻击 = BB_player.攻击;
      A_player.防御 = BB_player.防御;
    }
    msg.push(`第${cnt2 + 1}回合：
  ${A_player.名号}攻击了${B_player.名号}，${ifbaoji(baoji)}造成伤害${伤害}，${
      B_player.名号
    }剩余血量${B_player.当前血量}`);
    cnt++;
  }
  if (cnt % 2 == 0) {
    t = A_player;
    A_player = B_player;
    B_player = t;
  }
  if (A_player.当前血量 <= 0) {
    AA_player.当前血量 = 0;
    msg.push(`${BB_player.名号}击败了${AA_player.名号}`);
    B_xue = B_player.当前血量 - BB_player.当前血量;
    A_xue = -AA_player.当前血量;
  } else if (B_player.当前血量 <= 0) {
    BB_player.当前血量 = 0;
    msg.push(`${AA_player.名号}击败了${BB_player.名号}`);
    B_xue = -BB_player.当前血量;
    A_xue = A_player.当前血量 - AA_player.当前血量;
  }
  let Data_nattle = { msg: msg, A_xue: A_xue, B_xue: B_xue };
  return Data_nattle;
}

export function baojishanghai(baojilv) {
  if (baojilv > 1) {
    baojilv = 1;
  } //暴击率最高为100%,即1
  let rand = Math.random();
  let bl = 1;
  if (rand < baojilv) {
    bl = baojilv + 1.5; //这个是暴击伤害倍率//满暴击时暴伤2为50%
  }
  return bl;
}
//攻击攻击防御计算伤害
export function Harm(atk, def) {
  let x;
  let s = atk / def;
  let rand = Math.trunc(Math.random() * 11) / 100 + 0.95; //保留±5%的伤害波动
  if (s < 1) {
    x = 0.1;
  } else if (s > 2.5) {
    x = 1;
  } else {
    x = 0.6 * s - 0.5;
  }
  x = Math.trunc(x * atk * rand);
  return x;
}
//判断克制关系
export function kezhi(equ, wx) {
  let wuxing = ['金', '木', '土', '水', '火', '金'];
  let equ_wx = wuxing[equ - 1];
  //相同
  for (let j of wx) {
    if (j == equ_wx) return 0.04;
  }
  //不同
  for (let j of wx)
    for (let i = 0; i < wuxing.length - 1; i++) {
      if (wuxing[i] == equ_wx && wuxing[i + 1] == j) return -0.02;
    }
  return 0;
}
//通过暴击伤害返回输出用的文本
export function ifbaoji(baoji) {
  if (baoji == 1) {
    return '';
  } else {
    return '触发暴击，';
  }
}
//写入交易表
export async function Write_Exchange(wupin) {
  let dir = path.join(__PATH.Exchange, `Exchange.json`);
  let new_ARR = JSON.stringify(wupin, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return;
}

//写入交易表
export async function Write_Forum(wupin) {
  let dir = path.join(__PATH.Exchange, `Forum.json`);
  let new_ARR = JSON.stringify(wupin, '', '\t');
  fs.writeFileSync(dir, new_ARR, 'utf8', err => {
    console.log('写入成功', err);
  });
  return;
}

//读交易表
export async function Read_Exchange() {
  let dir = path.join(`${__PATH.Exchange}/Exchange.json`);
  let Exchange = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  Exchange = JSON.parse(Exchange);
  return Exchange;
}

//读交易表
export async function Read_Forum() {
  let dir = path.join(`${__PATH.Exchange}/Forum.json`);
  let Forum = fs.readFileSync(dir, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return 'error';
    }
    return data;
  });
  //将字符串数据转变成数组格式
  Forum = JSON.parse(Forum);
  return Forum;
}

export async function get_supermarket_img(e, thing_class) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let Exchange_list;
  try {
    Exchange_list = await Read_Exchange();
  } catch {
    await Write_Exchange([]);
    Exchange_list = await Read_Exchange();
  }
  for (let i = 0; i < Exchange_list.length; i++) {
    Exchange_list[i].num = i + 1;
  }
  if (thing_class) {
    Exchange_list = Exchange_list.filter(
      item => item.name.class == thing_class
    );
  }

  Exchange_list.sort(function (a, b) {
    return b.now_time - a.now_time;
  });
  let supermarket_data = {
    user_id: usr_qq,
    Exchange_list: Exchange_list,
  };
  const data1 = await new Show(e).get_supermarketData(supermarket_data);
  let img = await puppeteer.screenshot('supermarket', {
    ...data1,
  });
  return img;
}

export async function get_forum_img(e, thing_class) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let Forum;
  try {
    Forum = await Read_Forum();
  } catch {
    await Write_Forum([]);
    Forum = await Read_Forum();
  }
  for (let i = 0; i < Forum.length; i++) {
    Forum[i].num = i + 1;
  }
  if (thing_class) {
    Forum = Forum.filter(item => item.class == thing_class);
  }

  Forum.sort(function (a, b) {
    return b.now_time - a.now_time;
  });
  let forum_data = {
    user_id: usr_qq,
    Forum: Forum,
  };
  const data1 = await new Show(e).get_forumData(forum_data);
  let img = await puppeteer.screenshot('forum', {
    ...data1,
  });
  return img;
}

export async function openAU() {
  const redisGlKey = 'xiuxian:AuctionofficialTask_GroupList';

  const random = Math.floor(Math.random() * data.xingge[0].one.length);
  const thing_data = data.xingge[0].one[random];
  const thing_value = Math.floor(thing_data.出售价);
  const thing_amount = 1;
  const now_time = new Date().getTime();
  const groupList = await redis.sMembers(redisGlKey);

  const wupin = {
    thing: thing_data,
    start_price: thing_value,
    last_price: thing_value,
    amount: thing_amount,
    last_offer_price: now_time,
    last_offer_player: 0,
    groupList,
  };
  await redis.set('xiuxian:AuctionofficialTask', JSON.stringify(wupin));
  return wupin;
}



export async function Goweizhi(e, weizhi, addres) {
//  let adr = addres;
//  let msg = ['***' + adr + '***'];
//  for (let i = 0; i < weizhi.length; i++) {
//    msg.push(
//      weizhi[i].name +
//       '\n' +
 //       '等级：' +
  //      weizhi[i].Grade +
//        '\n' +
//        '极品：' +
//        weizhi[i].Best[0] +
//        '\n' +
//        '灵石：' +
//        weizhi[i].Price +
//        '灵石'
//    );
//  }
//  await ForwardMsg(e, msg);
let get_data={didian_list: weizhi,
            addres:addres}
const data1 = await new Show(e).get_secret_placeData(get_data);
return await puppeteer.screenshot('secret_place', {
  ...data1,
});
}

/**
 * 增加player文件某属性的值（在原本的基础上增加）
 * @param user_qq
 * @param num 属性的value
 * @param type 修改的属性
 * @returns {Promise<void>}
 */
export async function setFileValue(user_qq, num, type) {
  let user_data = data.getData('player', user_qq);
  let current_num = user_data[type]; //当前灵石数量
  let new_num = current_num + num;
  if (type == '当前血量' && new_num > user_data.血量上限) {
    new_num = user_data.血量上限; //治疗血量需要判读上限
  }
  user_data[type] = new_num;
  await data.setData('player', user_qq, user_data);
  return;
}

export async function Synchronization_ASS(e) {
  if (!e.isMaster) {
    return;
  }
  e.reply('宗门开始同步');
  let assList = [];
  let files = fs
    .readdirSync('./plugins/' + AppName + '/resources/data/association')
    .filter(file => file.endsWith('.json'));
  for (let file of files) {
    file = file.replace('.json', '');
    assList.push(file);
  }
  for (let ass_name of assList) {
    let ass = await data.getAssociation(ass_name);
    let player = data.getData('player', ass.宗主);
    let now_level_id = data.Level_list.find(
      item => item.level_id == player.level_id
    ).level_id;
    //补
    if (!isNotNull(ass.power)) {
      ass.power = 0;
    }
    if (now_level_id < 42) {
      ass.power = 0; // 凡界
    } else {
      ass.power = 1; //  仙界
    }
    if (ass.power == 1) {
      if (ass.大阵血量 == 114514) {
        ass.大阵血量 = 1145140;
      }
      let level = ass.最低加入境界;
      if (level < 42) {
        ass.最低加入境界 = 42;
      }
    }
    if (ass.power == 0 && ass.最低加入境界 > 41) {
      ass.最低加入境界 = 41;
    }
    if (!isNotNull(ass.宗门驻地)) {
      ass.宗门驻地 = 0;
    }
    if (!isNotNull(ass.宗门建设等级)) {
      ass.宗门建设等级 = 0;
    }
    if (!isNotNull(ass.宗门神兽)) {
      ass.宗门神兽 = 0;
    }
    if (!isNotNull(ass.副宗主)) {
      ass.副宗主 = [];
    }
    await data.setAssociation(ass_name, ass);
  }

  e.reply('宗门同步结束');
  return;
}

export async function synchronization(e) {
  if (!e.isMaster) {
    return;
  }
  e.reply('存档开始同步');
  let playerList = [];
  let files = fs
    .readdirSync('./plugins/' + AppName + '/resources/data/xiuxian_player')
    .filter(file => file.endsWith('.json'));
  for (let file of files) {
    file = file.replace('.json', '');
    playerList.push(file);
  }
  for (let player_id of playerList) {
    let usr_qq = player_id;
    let player = await data.getData('player', usr_qq);
    let najie = await Read_najie(usr_qq);
    let equipment = await Read_equipment(usr_qq);
    let ziduan = [
      '镇妖塔层数',
      '神魄段数',
      '魔道值',
      '师徒任务阶段',
      '师徒积分',
      'favorability',
      '血气',
      'lunhuiBH',
      'lunhui',
      '攻击加成',
      '防御加成',
      '生命加成',
      '幸运',
      '练气皮肤',
      '装备皮肤',
      'islucky',
      'sex',
      'addluckyNo',
      '神石',
    ];
    let ziduan2 = [
      'Physique_id',
      'linggenshow',
      'power_place',
      'occupation_level',
      '血量上限',
      '当前血量',
      '攻击',
      '防御',
    ];
    let ziduan3 = ['linggen', 'occupation', '仙宠'];
    let ziduan4 = ['材料', '草药', '仙宠', '仙宠口粮','宝石'];
    for (let k of ziduan) {
      if (!isNotNull(player[k])) {
        player[k] = 0;
      }
    }
    for (let k of ziduan2) {
      if (!isNotNull(player[k])) {
        player[k] = 1;
      }
    }
    for (let k of ziduan3) {
      if (!isNotNull(player[k])) {
        player[k] = [];
      }
    }
    for (let k of ziduan4) {
      if (!isNotNull(najie[k])) {
        najie[k] = [];
      }
    }
    if (!isNotNull(player.breakthrough)) {
      player.breakthrough = false;
    }
    if (!isNotNull(player.id)) {
      player.id = usr_qq;
    }
    if (!isNotNull(player.轮回点) || player.轮回点 > 10) {
      player.轮回点 = 10 - player.lunhui;
    }
    
    try {
      await Read_danyao(usr_qq);
    } catch {
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
    }

    let suoding = [
      '装备',
      '丹药',
      '道具',
      '功法',
      '草药',
      '材料',
      '仙宠',
      '仙宠口粮',
      '宝石',
    ];
    for (let j of suoding) {
      najie[j].forEach(item => {
        if (!isNotNull(item.islockd)) {
          item.islockd = 0;
        }
      });
    }
    //仙宠调整
    if (player.仙宠.id > 2930 && player.仙宠.id < 2936) {
      player.仙宠.初始加成 = 0.002;
      player.仙宠.每级增加 = 0.002;
      player.仙宠.加成 = player.仙宠.每级增加 * player.仙宠.等级;
      player.幸运 = player.addluckyNo + player.仙宠.加成;
    } else player.幸运 = player.addluckyNo;
    for (let j of najie.仙宠) {
      if (j.id > 2930 && player.仙宠.id < 2936) {
        j.初始加成 = 0.002;
        j.每级增加 = 0.002;
      }
    }
    //装备调整
    let wuqi = ['雾切之回光', '护摩之杖', '磐岩结绿', '三圣器·朗基努斯之枪'];
    let wuqi2 = ['紫云剑', '炼血竹枪', '少阴玉剑', '纯阴金枪'];
    for (let j of najie.装备) {
      for (let k in wuqi) {
        if (j.name == wuqi[k]) {
          j.name = wuqi2[k];
        }
        if (equipment.武器.name == wuqi[k]) equipment.武器.name = wuqi2[k];
        if (equipment.法宝.name == wuqi[k]) equipment.法宝.name = wuqi2[k];
      }
    }
    //口粮调整
    for (let j of najie.仙宠口粮) {
      j.class = '仙宠口粮';
    }
    let linggeng = data.talent_list.find(item => item.name == player.灵根.name);
    if (linggeng) player.灵根 = linggeng;

    //隐藏灵根
    if (player.隐藏灵根)
      player.隐藏灵根 = data.yincang.find(
        item => item.name == player.隐藏灵根.name
      );
    //重新根据id去重置仙门
    let now_level_id = await data.Level_list.find(
      item => item.level_id == player.level_id
    ).level_id;
    if (now_level_id < 42) {
      player.power_place = 1;
    }
   
  //   for(let m=0;m<type.length;m++){
  //     let a = equipment[type[m]]['宝石位']
  //     a = ""
  //     await Write_equipment(usr_qq, equipment);
  //     }
  //   for(let m=0;m<type.length;m++){
  //    if(!"宝石位" in equipment[type[m]]){
  //     equipment[type[m]]['宝石位']={
  //       "宝石位1":"无",
  //       "宝石位2":"无",
  //       "宝石位3":"无",
  //     }
  //   }
  //   await Write_equipment(usr_qq, equipment);
  // }
  // for(let m;m<type.length;m++){
  //   if(!"宝石位" in equipment[type[m]]){
  //     equipment[type[m]]['宝石位']={
  //       '宝石位1':"无",
  //       '宝石位2':'无',
  //       "宝石位3":"无"
  //     }
  //     await Write_equipment(usr_qq, equipment);
  //   }else{
  //     delete equipment[type[m]]['宝石位']
  //     equipment[type[m]]['宝石位']={
  //       '宝石位1':"无",
  //       '宝石位2':'无',
  //       "宝石位3":"无"
  //     }
  //     await Write_equipment(usr_qq, equipment);
  //   }
  //   //宝石镶嵌位
  //   for (let p = 0; p < type.length; p++) {
  //     for(let m=0;m<type.length;m++){
  //       if(Object.keys(equipment[type[m]]).length!=13){
  //         equipment[type[m]]['宝石位']={
  //           "宝石位1":"无",
  //           "宝石位2":"无",
  //           "宝石位3":"无",
  //         }
  //         await Write_equipment(usr_qq, equipment);
  //       }
  //     }
        // else if (equipment[type[m]]['宝石位'] != '') {
        //   if (equipment[type[m]].宝石位.宝石位1 == 0) {
        //     equipment[type[m]]['宝石位']['宝石位1'] = "无"
        //  } else if (equipment[type[m]].宝石位.宝石位2 == 0) {
        //    equipment[type[m]]['宝石位']['宝石位2'] = "无"
        //  } else if (equipment[type[m]].宝石位.宝石位3 == 0) {
        //    equipment[type[m]]['宝石位']['宝石位3'] = "无"
        // }
  
        
    
    // let type=[
    //   '武器',
    //   '护具',
    //   '法宝'
    // ]

    // //宝石镶嵌位
    // for(let m=0;m<type.length;m++){
    //   if(Object.keys(equipment[type[m]]).length!=13){
    //     equipment[type[m]]['宝石位']={
    //       "宝石位1":"无",
    //       "宝石位2":"无",
    //       "宝石位3":"无",
    //     }
    //   }
    // }
    await cheakbaoshi(e,usr_qq)
    await Write_najie(usr_qq, najie);
    await Write_player(usr_qq, player);
    await Write_equipment(usr_qq, equipment);
  }
  e.reply('存档同步结束');

  // NOTE: 魔术师同步，开发者专用，要使用请删除注释
  /*
    const thingType = ''; // 填写欲抹除物品类型
    const thingName = ''; // 填写欲抹除物品名称
  
    const objArr = await clearNajieThing(thingType, thingName);
    e.reply('物品自动抹除结束');
  
    const newThingType = '';
    const newThingName = ''; // 填写新物品
    const N = 1; // 填写
  
    objArr.map(uid_tnum => {
      const usrId = Object.entries(uid_tnum)[0][0];
      Add_najie_thing(usrId, newThingName, newThingType, uid_tnum.usrId * N);
    });
    e.reply('物品自动替换结束');
  */
  return;
}

export async function channel(usr_qq) {
  const dir = path.join(`${__PATH.channel}/channel.json`);
  const logfile = fs.readFileSync(dir, 'utf8');
  const allRecords = JSON.parse(logfile);
   if (usr_qq.length > 16) {
    for (let record of allRecords) {
      if (record.频道_ID == usr_qq) {
        usr_qq = record.QQ_ID; // 使用存档的 usr_qq
        let ifexistplay = data.existData("player", usr_qq);
        if (!ifexistplay) {
          usr_qq = record.频道_ID; // 使用存档的 usr_qq
        }
        break;
      }
    }
  } else {
    for (let record of allRecords) {
      if (record.频道_ID == usr_qq) {
        usr_qq = record.QQ_ID; // 使用存档的 usr_qq
        let ifexistplay = data.existData("player", usr_qq);
        if (!ifexistplay) {
          usr_qq = record.频道_ID; // 使用存档的 usr_qq
        }
        break;
      }
    }
  }
  return usr_qq; // 返回转换后的 usr_qq 值
}

/**
 *
 * @param {*} thing_name 物品名
 * @returns
 */
//遍历物品
export async function foundthing(thing_name) {
  let thing = [
    'equipment_list',
    'danyao_list',
    'daoju_list',
    'gongfa_list',
    'caoyao_list',
    'timegongfa_list',
    'timeequipmen_list',
    'timedanyao_list',
    'newdanyao_list',
    'xianchon',
    'xianchonkouliang',
    'duanzhaocailiao',
    'kamian',
    'kamian3',
	// 'shicai_list',
	// 'cailiao_list',
  'baoshi_list'
  ];
  for (var i of thing) {
    for (var j of data[i]) {
      if (j.name == thing_name) return j;
    }
  }
  let A;
  try {
    A = await Read_it();
  } catch {
    await Writeit([]);
    A = await Read_it();
  }
  if (typeof thing_name != 'string') {
    thing_name=thing_name.name
   }
  for (var j of A) {
    if (j.name == thing_name) return j;
  }
  thing_name = thing_name.replace(/[0-9]+/g, '');
  thing = ['duanzhaowuqi', 'duanzhaohuju', 'duanzhaobaowu', 'zalei'];
  for (var i of thing) {
    for (var j of data[i]) {
      if (j.name == thing_name) return j;
    }
  }
  return false;
}





export async function get_shitujifen_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);;
  let player = await Read_player(usr_qq);
  let commodities_list = data.shitujifen;
  let jifen = player.师徒积分;
  let tianditang_data = {
    name: player.名号,
    jifen: jifen,
    commodities_list: commodities_list,
  };
  const data1 = await new Show(e).get_shitujifenData(tianditang_data);
  return await puppeteer.screenshot('shitujifen', {
    ...data1,
  });
}
//提交任务
export async function get_tijiao_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);;
  let player = await Read_player(usr_qq);
  let user_A;
  let A = e.user_id.toString().replace('qg_','');
    A = await channel(A);;
  user_A = A;
  let shitu = await Read_shitu();
  let i = await found_shitu_2(user_A);
  let jifen = shitu[i].师傅;
  let player2 = await Read_player(jifen);
  if (
    shitu[i].任务阶段 == 1 &&
    shitu[i].renwu1 == 2 &&
    shitu[i].renwu2 == 2 &&
    shitu[i].renwu3 == 2
  ) {
    shitu[i].任务阶段 = 2;
    shitu[i].renwu1 = 1;
    shitu[i].renwu2 = 1;
    shitu[i].renwu3 = 1;
    await Write_shitu(shitu);
    player.师徒任务阶段 = 2;
    await Write_player(usr_qq, player);
    player2.师徒积分 += 5;
    await Write_player(jifen, player2);
    await Add_修为(usr_qq, 10000);
    await Add_灵石(usr_qq, 10000);
    await Add_血气(usr_qq, 10000);
    e.reply(
      '已完成阶段任务1\n获得奖励：\n1.修为*10000\n2.血气*10000\n3.灵石*10000\n师傅获得奖励：师徒积分*5'
    );
    return;
  } else if (
    shitu[i].任务阶段 == 2 &&
    shitu[i].renwu1 == 2 &&
    shitu[i].renwu2 == 2 &&
    shitu[i].renwu3 == 2
  ) {
    shitu[i].任务阶段 = 3;
    shitu[i].renwu1 = 1;
    shitu[i].renwu2 = 1;
    shitu[i].renwu3 = 1;
    await Write_shitu(shitu);
    player.师徒任务阶段 = 3;
    await Write_player(usr_qq, player);
    player2.师徒积分 += 15;
    await Write_player(jifen, player2);
    await Add_修为(usr_qq, 40000);
    await Add_灵石(usr_qq, 40000);
    await Add_血气(usr_qq, 40000);
    // await Add_najie_thing(usr_qq, '功法盒', '盒子', 1);
    // await Add_najie_thing(usr_qq, '药水盒', '盒子', 1);
    e.reply(
      '已完成阶段任务2\n获得奖励：\n1.修为*40000\n2.血气*40000\n3.灵石*40000\n师傅获得奖励：师徒积分*15'
    );
    return;
  } else if (
    shitu[i].任务阶段 == 3 &&
    shitu[i].renwu1 == 2 &&
    shitu[i].renwu2 == 2 &&
    shitu[i].renwu3 == 2
  ) {
    shitu[i].任务阶段 = 4;
    shitu[i].renwu1 = 1;
    shitu[i].renwu2 = 1;
    shitu[i].renwu3 = 1;
    await Write_shitu(shitu);
    player.师徒任务阶段 = 4;
    await Write_player(usr_qq, player);
    player2.师徒积分 += 20;
    await Write_player(jifen, player2);
    await Add_修为(usr_qq, 50000);
    await Add_灵石(usr_qq, 50000);
    await Add_血气(usr_qq, 50000);
    // await Add_najie_thing(usr_qq, '道具盒', '盒子', 1);
    // await Add_najie_thing(usr_qq, '功法盒', '盒子', 1);
    e.reply(
      '已完成阶段任务3\n获得奖励：\n1.修为*50000\n2.血气*50000\n2.灵石*50000\n师傅获得奖励：师徒积分*20'
    );
    return;
  } else if (
    shitu[i].任务阶段 == 4 &&
    shitu[i].renwu1 == 2 &&
    shitu[i].renwu2 == 2 &&
    shitu[i].renwu3 == 2
  ) {
    shitu[i].任务阶段 = 5;
    shitu[i].renwu1 = 1;
    shitu[i].renwu2 = 1;
    shitu[i].renwu3 = 1;
    await Write_shitu(shitu);
    player.师徒任务阶段 = 5;
    await Write_player(usr_qq, player);
    player2.师徒积分 += 30;
    await Write_player(jifen, player2);
    await Add_修为(usr_qq, 150000);
    await Add_灵石(usr_qq, 150000);
    await Add_血气(usr_qq, 150000);
    // await Add_najie_thing(usr_qq, '药水盒', '盒子', 1);
    // await Add_najie_thing(usr_qq, '道具盒', '盒子', 1);
    e.reply(
      '已完成阶段任务4\n获得奖励：\n1.修为*150000\n2.血气*150000\n3.灵石*150000\n师傅获得奖励：师徒积分*30'
    );
    return;
  } else if (
    shitu[i].任务阶段 == 5 &&
    shitu[i].renwu1 == 2 &&
    shitu[i].renwu2 == 2 &&
    shitu[i].renwu3 == 2
  ) {
    shitu[i].任务阶段 = 0;
    shitu[i].renwu1 = 0;
    shitu[i].renwu2 = 0;
    shitu[i].renwu3 = 0;
    shitu[i].未出师徒弟 = 0;
    shitu[i].已出师徒弟.push(A);
    await Write_shitu(shitu);
    player.师徒任务阶段 = 6;
    await Write_player(usr_qq, player);
    player2.师徒积分 += 50;
    await Write_player(jifen, player2);
    await Add_修为(usr_qq, 250000);
    await Add_灵石(usr_qq, 250000);
    await Add_血气(usr_qq, 250000);
    // await Add_najie_thing(usr_qq, '功法盒', '盒子', 3);
    // await Add_najie_thing(usr_qq, '药水盒', '盒子', 3);
    // await Add_najie_thing(usr_qq, '道具盒', '盒子', 3);
    e.reply(
      '已完成阶段任务5，恭喜你成功出师！\n获得奖励：\n1.修为*250000\n2.血气*250000\n3.灵石*250000\n师傅获得奖励：师徒积分*50'
    );
    return;
  } else if (
    shitu[i].renwu1 == 1 ||
    shitu[i].renwu2 == 1 ||
    shitu[i].renwu3 == 1
  ) {
    e.reply('你还有任务没完成哦~');
    return;
  }
}

export async function found_shitu(A) {
  let shitu = await Read_shitu();
  let i;
  for (i = 0; i < shitu.length; i++) {
    if (shitu[i].师傅 == A) {
      break;
    }
  }
  return i;
}
export async function found_shitu_2(A) {
  let shitu = await Read_shitu();
  let i;
  for (i = 0; i < shitu.length; i++) {
    if (shitu[i].未出师徒弟 == A) {
      break;
    }
  }
  return i;
}
//检索任务状态
export async function get_renwu_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);;
  let player = await Read_player(usr_qq);
  let user_A;
  let A = e.user_id.toString().replace('qg_','');
    A = await channel(A);;
  user_A = A;
  let shitu = await Read_shitu();
  let i = await found_shitu_2(user_A);
  let shifu = await find_shitu(A);
  let tudi = await find_tudi(A);
  //无存档
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  //判断对方有没有存档
  if (shifu == 0 && tudi == 0) {
    e.reply('你还没拜师&收徒过！');
    return;
  }
  if (shitu[i].任务阶段 == 1) {
    if (shitu[i].renwu1 == 1 && player.level_id > 9) {
      shitu[i].renwu1 = 2;
    }
    if (shitu[i].renwu2 == 1 && player.Physique_id > 9) {
      shitu[i].renwu2 = 2;
    }
    if (shitu[i].renwu3 == 1 && player.学习的功法 != 0) {
      shitu[i].renwu3 = 2;
    }
    await Write_shitu(shitu);
  } else if (shitu[i].任务阶段 == 2) {
    if (shitu[i].renwu1 == 1 && player.level_id > 17) {
      shitu[i].renwu1 = 2;
    }
    if (shitu[i].renwu2 == 1 && player.Physique_id > 16) {
      shitu[i].renwu2 = 2;
    }
    if (shitu[i].renwu3 == 1 && player.linggenshow == 0) {
      shitu[i].renwu3 = 2;
    }
    await Write_shitu(shitu);
  } else if (shitu[i].任务阶段 == 3) {
    if (shitu[i].renwu1 == 1 && player.level_id > 25) {
      shitu[i].renwu1 = 2;
    }
    if (shitu[i].renwu2 == 1 && player.Physique_id > 23) {
      shitu[i].renwu2 = 2;
    }
    if (shitu[i].renwu3 == 1 && player.灵石 > 3999999) {
      shitu[i].renwu3 = 2;
    }
    await Write_shitu(shitu);
  } else if (shitu[i].任务阶段 == 4) {
    if (shitu[i].renwu1 == 1 && player.level_id > 33) {
      shitu[i].renwu1 = 2;
    }
    if (shitu[i].renwu2 == 1 && player.Physique_id > 30) {
      shitu[i].renwu2 = 2;
    }
    if (
      shitu[i].renwu3 == 1 &&
      player.occupation != 0 &&
      player.occupation_level > 9
    ) {
      shitu[i].renwu3 = 2;
    }
    await Write_shitu(shitu);
  } else if (shitu[i].任务阶段 == 5) {
    if (shitu[i].renwu1 == 1 && player.level_id > 41) {
      shitu[i].renwu1 = 2;
    }
    if (shitu[i].renwu2 == 1 && player.Physique_id > 37) {
      shitu[i].renwu2 = 2;
    }
    if (shitu[i].renwu3 == 1 && shitu[i].师徒BOOS剩余血量 < 1) {
      shitu[i].renwu3 = 2;
    }
    await Write_shitu(shitu);
  } else if (player.师徒任务阶段 != 0 && player.师徒任务阶段 != 6) {
    shitu[i].renwu1 = 1;
    shitu[i].renwu2 = 1;
    shitu[i].renwu3 = 1;
    shitu[i].任务阶段 = player.师徒任务阶段;
    shitu[i].师徒BOOS剩余血量 = 100000000;
    await Write_shitu(shitu);
    e.reply(
      `任务已刷新！\n你上次任务进行到了阶段${player.师徒任务阶段}已自动为你延续`
    );
    return;
  } else if (player.任务阶段 != 6) {
    shitu[i].renwu1 = 1;
    shitu[i].renwu2 = 1;
    shitu[i].renwu3 = 1;
    shitu[i].任务阶段 = 1;
    shitu[i].师徒BOOS剩余血量 = 100000000;
    await Write_shitu(shitu);
    player.师徒任务阶段 = 1;
    await Write_player(usr_qq, player);
    e.reply('任务已刷新！');
    return;
  } else {
    e.reply('你已经毕业了，就别来做师徒任务了吧');
    return;
  }
  return;
}
/**
 * 我的弟子
 * @return image
 */
export async function get_shitu_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);;
  let player = await Read_player(usr_qq);
  let user_A;
  let A = e.user_id.toString().replace('qg_','');
    A = await channel(A);;
  user_A = A;
  let shitu = await Read_shitu();
  let x = await found_shitu(user_A);
  let shifu = await find_shitu(A);
  //无存档
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  //判断对方有没有存档
  if (shifu == 0) {
    e.reply('你还没有收过徒弟');
    return;
  }

  let action = await find_shitu(A);
  if (action == false) {
    await fstadd_shitu(A);
  }
  let newaction = await Read_shitu();
  let i;
  for (i = 0; i < newaction.length; i++) {
    if (newaction[i].师傅 == A) {
      //有加入宗门
      let ass;
      ass = player.师徒积分;
      let renwu1 = '当前没有任务';
      let renwu2 = '当前没有任务';
      let renwu3 = '当前没有任务';
      let wc1;
      let wc2;
      let wc3;
      let new1 = 0;
      if (newaction[i].未出师徒弟 != 0) {
        new1 = 1;
      }
      let item;
      let chengyuan = [];
      for (item in newaction[i].已出师徒弟) {
        chengyuan[item] =
          '道号：' +
          data.getData('player', newaction[i].已出师徒弟[item]).名号 +
          'QQ：' +
          newaction[i].已出师徒弟[item];
      }
      if (shitu[x].任务阶段 == 1) {
        renwu1 = '练气等级达到筑基巅峰';
        renwu2 = '炼体等级达到炼肉巅峰';
        renwu3 = '学习一个功法';
      } else if (shitu[x].任务阶段 == 2) {
        renwu1 = '练气等级达到元婴中期';
        renwu2 = '练体等级达到炼骨初期';
        renwu3 = '消耗一个定灵珠';
      } else if (shitu[x].任务阶段 == 3) {
        renwu1 = '练气等级达到化神圆满';
        renwu2 = '练体等级达到炼血后期';
        renwu3 = '拥有400w灵石(此项任务不会扣除灵石！)';
      } else if (shitu[x].任务阶段 == 4) {
        renwu1 = '练气等级达到合体后期';
        renwu2 = '练体等级达到炼脏圆满';
        renwu3 = '进行一次转职且等级到达黄袍中品';
      } else if (shitu[x].任务阶段 == 5) {
        renwu1 = '羽化登仙';
        renwu2 = '练体等级达到炼神中期';
        renwu3 = '击败师徒BOSS';
      }
      if (shitu[x].renwu1 == 0) {
        wc1 = '(未接取)';
      } else if (shitu[x].renwu1 == 1) {
        wc1 = '(未完成)';
      } else if (shitu[x].renwu1 == 2) {
        wc1 = '(已完成)';
      }
      if (shitu[x].renwu2 == 0) {
        wc2 = '(未接取)';
      } else if (shitu[x].renwu2 == 1) {
        wc2 = '(未完成)';
      } else if (shitu[x].renwu2 == 2) {
        wc2 = '(已完成)';
      }
      if (shitu[x].renwu3 == 0) {
        wc3 = '(未接取)';
      } else if (shitu[x].renwu3 == 1) {
        wc3 = '(未完成)';
      } else if (shitu[x].renwu3 == 2) {
        wc3 = '(已完成)';
      }
      let newchengyuan = data.getData('player', newaction[i].未出师徒弟).名号;
      let shitu_data = {
        user_id: usr_qq,
        minghao: player.名号,
        shifu: newaction[i].师傅,
        shimen: ass,
        renwu: newaction[i].任务阶段,
        tudinum: newaction[i].已出师徒弟.length + new1,
        rw1: renwu1,
        rw2: renwu2,
        rw3: renwu3,
        wancheng1: wc1,
        wancheng2: wc2,
        wancheng3: wc3,
        chengyuan: chengyuan,
        newchengyuan: newchengyuan,
      };
      const data1 = await new Show(e).get_shituData(shitu_data);
      return await puppeteer.screenshot('shitu', {
        ...data1,
      });
    }
  }
}
/**
 * 我的师傅
 * @return image
 */
export async function get_shifu_img(e) {
  let usr_qq = e.user_id.toString().replace('qg_','');
    usr_qq = await channel(usr_qq);;
  let player = await Read_player(usr_qq);
  let user_A;
  let A = e.user_id.toString().replace('qg_','');
    A = await channel(A);;
  user_A = A;
  let shitu = await Read_shitu();
  let x = await found_shitu_2(user_A);
  //无存档
  let ifexistplay = data.existData('player', usr_qq);
  if (!ifexistplay) {
    return;
  }
  let action = await find_shitu(A);
  if (action == false) {
    await fstadd_shitu(A);
  }
  let newaction = await Read_shitu();
  let i;
  let newi = await chushi(A);
  if (newi == undefined) {
    newi = [5, 5];
  }
  for (i = 0; i < newaction.length; i++) {
    if (newaction[i].未出师徒弟 == A || newi[0] == A) {
      //有加入宗门;
      if (newi[0] == A) {
        newaction[i] = newi[1];
      }
      let ass;
      ass = player.师徒积分;
      let renwu1 = '请先输入"#提交任务"获取任务';
      let renwu2 = '请先输入"#提交任务"获取任务';
      let renwu3 = '请先输入"#提交任务"获取任务';
      let wc1;
      let wc2;
      let wc3;
      let new1 = 0;
      if (newaction[i].未出师徒弟 != 0) {
        new1 = 1;
      }
      let item;
      let chengyuan = [];
      for (item in newaction[i].已出师徒弟) {
        if (newaction[i].已出师徒弟[item] == A) {
          continue;
        }
        chengyuan[item] =
          '道号：' +
          data.getData('player', newaction[i].已出师徒弟[item]).名号 +
          'QQ：' +
          newaction[i].已出师徒弟[item];
      }
      if (shitu[x].任务阶段 == 1) {
        renwu1 = '练气等级达到筑基巅峰';
        renwu2 = '炼体等级达到炼肉巅峰';
        renwu3 = '学习一个功法';
      } else if (shitu[x].任务阶段 == 2) {
        renwu1 = '练气等级达到元婴中期';
        renwu2 = '练体等级达到炼骨初期';
        renwu3 = '消耗一个定灵珠';
      } else if (shitu[x].任务阶段 == 3) {
        renwu1 = '练气等级达到化神圆满';
        renwu2 = '练体等级达到炼血后期';
        renwu3 = '拥有400w灵石(此项任务不会扣除灵石！)';
      } else if (shitu[x].任务阶段 == 4) {
        renwu1 = '练气等级达到合体后期';
        renwu2 = '练体等级达到炼脏圆满';
        renwu3 = '进行一次转职且等级到达黄袍中品';
      } else if (shitu[x].任务阶段 == 5) {
        renwu1 = '羽化登仙';
        renwu2 = '练体等级达到炼神中期';
        renwu3 = '击败师徒BOSS';
      }
      if (shitu[x].renwu1 == 0) {
        wc1 = '(未接取)';
      } else if (shitu[x].renwu1 == 1) {
        wc1 = '(未完成)';
      } else if (shitu[x].renwu1 == 2) {
        wc1 = '(已完成)';
      }
      if (shitu[x].renwu2 == 0) {
        wc2 = '(未接取)';
      } else if (shitu[x].renwu2 == 1) {
        wc2 = '(未完成)';
      } else if (shitu[x].renwu2 == 2) {
        wc2 = '(已完成)';
      }
      if (shitu[x].renwu3 == 0) {
        wc3 = '(未接取)';
      } else if (shitu[x].renwu3 == 1) {
        wc3 = '(未完成)';
      } else if (shitu[x].renwu3 == 2) {
        wc3 = '(已完成)';
      }
    }
  }
      let shifu = data.getData('player', newaction[i].师傅).名号;
      let shifu_data = {
        user_id: usr_qq,
        minghao: player.名号,
        shifu: shifu,
        shimen: ass,
        renwu: newaction[i].任务阶段,
        tudinum: newaction[i].已出师徒弟.length + new1,
        rw1: renwu1,
        rw2: renwu2,
        rw3: renwu3,
        wancheng1: wc1,
        wancheng2: wc2,
        wancheng3: wc3,
        chengyuan: chengyuan,
      };
      const data1 = await new Show(e).get_shifuData(shifu_data);
      return await puppeteer.screenshot('shifu', {
        ...data1,
      });
    
}

// }<---这个括号导致整个插件无法运行，罪大恶极

export async function chushi(A) {
  let t;
  let i;
  let newaction = await Read_shitu();
  for (i = 0; i < newaction.length; i++) {
    for (t = 0; t < newaction[i].已出师徒弟.length; t++) {
      if (newaction[i].已出师徒弟[t] == A) {
        return [newaction[i].已出师徒弟[t], newaction[i]];
      }
    }
  }
}


