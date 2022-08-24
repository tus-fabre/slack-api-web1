'use strict';

/*
 * [FILE] app.js
 *
 * [DESCRIPTION]
 *  Lesson Web 1 - WEBサービスにアクセスする（その1）
 * 　スラッシュコマンド引数なし
 * 
 * [NOTE]
 */
const { getCountryInfo } = require('./functions/covid19'); //追加
const { currentTime, currentHour } = require('./functions/current_time');
const env = require('dotenv').config();
const nodeEnv=process.env.NODE_ENV;
if (nodeEnv == 'development') {
  console.log("開発モードで起動します");
  console.log(env.parsed);
}

console.log("アプリを起動します");
let datetime = currentTime();
console.log("現在の時刻", datetime);

const { App } = require('@slack/bolt');
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

/*
 * ---------- Message Listeners ----------
 */

/*
 * [MESSAGE LISTENER] hello
 *
 * [DESCRIPTION]
 *  メッセージ'hello'を受け取ったときに起動する関数
 * 
 * [INPUTS]
 *  command - 利用しない
 * 
 * [OUTPUTS]
 *  respond - 'こんにちは <ユーザー名>!'
 *
 * [NOTES]
 *  イベントがトリガーされたチャンネルに say() でメッセージを送信する
 */
app.message('hello', async ({ message, say }) => {
  // messageの内容を確認する
  if (nodeEnv == 'development') console.log(message);
  // メッセージを返信する
  await say(`こんにちは <@${message.user}>!`);
});

/*
 * ---------- Slash Commands ----------
 */

/*
 * [SLASH COMMAND] /hello
 *
 * [DESCRIPTION]
 *  /helloで起動する関数。
 *  現在時間（hour）に応じて、あいさつが異なる。
 * 
 * [INPUTS]
 *  command - 利用しない
 * 
 * [OUTPUTS]
 *  respond
 *    現在時間が4以上10未満のとき、'おはよう <ユーザー名>!'
 *    現在時間が10以上18未満のとき、'こんにちは <ユーザー名>!'
 *    それ以外（現在時間が18以上23未満、0以上4未満）、'こんばんは <ユーザー名>!'
 * 
 */
app.command('/hello', async({ack, respond, command})=>{
  // 予め返信しておく
  await ack();
  // commandの内容を確認する
  if (nodeEnv == 'development') console.log(command);
  // 現在時間を取得する
  let hour = currentHour();
  // あいさつの初期値
  let message = "こんばんは";
  if (4 <= hour && hour < 10) 
    message = "おはよう";
  else if (10 <= hour && hour < 18)
    message = "こんにちは";
  message += ` <@${command.user_id}>!`
  // コマンドに返答する
  await respond(message);
});

/*
 * [SLASH COMMAND] /covid19
 *
 * [DESCRIPTION]
 *  日本の新型コロナウィルス感染状況をSlack画面上に表示するコマンド
 * 
 * [INPUTS]
 *  command - 利用しない
 * 
 * [OUTPUTS]
 *  respond - JSON構造: {blocks:[<見出し>,<セクション>]}
 * 
 */
app.command('/covid19', async({ack, respond, command}) => {
  // 予め返信しておく
  await ack();
  // commandの内容を確認する
  if (nodeEnv == 'development') console.log(command);
  // 各国の感染状況を取得する
  let result = await getCountryInfo();
  // 開発モードのとき、出力の内容を表示する
  if (nodeEnv == 'development') console.log(result);
  // コマンドに返答する
  await respond(result);
});

/*
 * サーバーを起動する
 *
 */
(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Boltアプリが起動しました');
})();

/*
 * END OF FILE
 */