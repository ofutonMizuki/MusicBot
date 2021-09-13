import { Client, VoiceChannel, Guild, VoiceConnection } from "discord.js";

// discord.js モジュールのインポート
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const config = require('./config.json');

// Discord Clientのインスタンス作成
const client: Client = new Discord.Client();

function getTimeText() {
    let DD = new Date();

    return ("[" +
        ('00' + (DD.getFullYear())).slice(-4) + "-" +
        ('00' + (DD.getMonth() + 1)).slice(-2) + "-" +
        ('00' + DD.getDate()).slice(-2) + " " +
        ('00' + DD.getHours()).slice(-2) + ":" +
        ('00' + DD.getMinutes()).slice(-2) + ":" +
        ('00' + DD.getSeconds()).slice(-2) +
        "]");
}

function consoleLog(message: string) {
    console.log(getTimeText() + message);
}

// 準備完了
client.on('ready', () => {
    consoleLog('ready...');
})

// メッセージがあったら何かをする
client.on('message', message => {
    let prefix = config.prefix;

    if (message.author.bot) {
        return;
    }
    if (message.channel.type === 'text') {
        let command = message.content.split(" ")[0];

        let getConnect = function (guild: Guild | null) {
            if (client.voice == null || guild == null) {
                return null;
            }
            return client.voice.connections.get(guild.id);
        }

        let join = function (vc: VoiceChannel | null) {
            if (vc == null) {
                message.reply(`ボイスチャンネルに接続されていません`);
                return false;
            }
            else if (getConnect(vc.guild)) {
                message.reply(`すでに接続されています`);
                return false;
            }
            else if (vc.full) {
                message.reply(`ボイスチャンネルがいっぱいです`);
                return false;
            }
            else if (vc != undefined && vc.joinable) {
                vc.join();
                return true;
            }

            return false;
        }

        if (command == prefix + "join") {
            let VC: VoiceChannel | null = message.member != null ? message.member.voice.channel : null;
            join(VC);
        }

        else if (prefix + `p` == command || prefix + `play` == command) {
            if (!getConnect(message.guild)) {
                let VC: VoiceChannel | null = message.member != null ? message.member.voice.channel : null;
                if(!join(VC)) return;
            }

            let reg = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm;

            let connect: VoiceConnection | undefined | null;
            //もしボイスチャンネルに接続されていたら
            if (connect = getConnect(message.guild)) {
                //もし引数の数が1個以上であれば
                if (message.content.split(" ").length > 1) {
                    //もし第一引数がYouTubeのURLでなかったら
                    if (!message.content.split(" ")[1].match(reg)) {
                        message.reply('検索機能は未実装です');
                    } else {
                        //再生する
                        const dispatcher = connect.play(ytdl(message.content.split(" ")[1]));
                        dispatcher.on(`speaking`, speaking => {
                            if (speaking == false) {
                                message.reply(`再生が終了しました`);
                            }
                        });
                    }
                } else {
                    message.reply(`引数が不正です`);
                }
            }
            else {

            }
        }

        else if (prefix + `dc` == command || prefix + `disconnect` == command) {
            let connect: VoiceConnection | undefined | null;
            if (connect = getConnect(message.guild)) {
                connect.disconnect();
            }
        }
    }
})

// Discordへの接続
client.login(config.token);