'use strict';

/*
 * [FILE] covid19.js
 *
 * [DESCRIPTION]
 *  新型コロナウィルスの感染状況を提示する関数を定義するファイル
 * 
 */
const { httpGet } = require('./http_get');

require('dotenv').config();
// disease.shにアクセスするためのベースURL
const BASE_URL=process.env.BASE_URL;

// ---------- Functions ----------

/*
 * [FUNCTION] getCountryInfo()
 *
 * [DESCRIPTION]
 *  日本の新型コロナウィルス感染状況をSlack向けブロック構造として整形する
 * 
 * [INPUTS] なし
 * 
 * [OUTPUTS]
 *  成功: {blocks:[<見出し>, <セクション>]}
 *  失敗: {type:"plain_text", text:"<エラーメッセージ>"}
 * 
 * [NOTE]
 *  アクセスするURL:
 *   https://disease.sh/v3/covid-19/countries/Japan
 * 
 *  toLocaleString()は数値を三桁区切りにする。
 */
exports.getCountryInfo = async () => {

  let retVal = null;
  // 対象URLにアクセスし、結果をJSONで取得する
  const result = await httpGet(BASE_URL + "countries/Japan");

  let blocks = [];
  if (result != null) {
    let population = Number(result.population).toLocaleString(); //人口
    // 見出しの構造を生成する
    let objheader = {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": `[国名] 日本 [人口] ${population}`,
        "emoji": true
      }
    }
    blocks.push(objheader);

    let active    = Number(result.active).toLocaleString(); //感染者数
    let critical  = Number(result.critical).toLocaleString(); //重病者数
    let recovered = Number(result.recovered).toLocaleString(); //退院・療養終了
    let cases     = Number(result.cases).toLocaleString(); //感染者累計
    let deaths    = Number(result.deaths).toLocaleString(); //死亡者累計
    let tests     = Number(result.tests).toLocaleString(); //検査数

    // 本体となるセクション構造を生成する
    let objBody = {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": `*感染者数:* ${active}`
        },
        {
          "type": "mrkdwn",
          "text": `*重病者数:* ${critical}`
        },
        {
          "type": "mrkdwn",
          "text": `*退院・療養終了:* ${recovered}`
        },
        {
          "type": "mrkdwn",
          "text": `*感染者累計:* ${cases}`
        },
        {
          "type": "mrkdwn",
          "text": `*死亡者累計:* ${deaths}`
        },
        {
          "type": "mrkdwn",
          "text": `*検査数:* ${tests}`
        },
      ]
    }
    blocks.push(objBody);

    // 区切り線
    let objDivider = {
      "type": "divider"
    };
    blocks.push(objDivider);

    retVal = {
      "blocks": blocks
    };
  } else {
    retVal = {
      "type": "plain_text",
      "text": `日本の情報は見つかりませんでした`,
      "emoji": true
    };
  }

  return (retVal);
};

/*
 * END OF FILE
 */