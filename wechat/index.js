const Wechat = require('../wechat-lib')
const WechatOAuth = require('../wechat-lib/oauth')
const config = require('../config/config')
const mongoose = require('mongoose')

const Token = mongoose.model('Token')
const Ticket = mongoose.model('Ticket')

const wechatCfg = {
    wechat: {
        appID: config.wechat.appID,
        appSecret: config.wechat.appSecret,
        token: config.wechat.token,
        getAccessToken: async () => {
            const res = await Token.getAccessToken()

            return res
        },
        saveAccessToken: async (data) => {
            const res = await Token.saveAccessToken(data)

            return res
        },
        getTicket: async () => {
            const res = await Ticket.getTicket()

            return res
        },
        saveTicket: async (data) => {
            const res = await Ticket.saveTicket(data)

            return res
        }
    }
}

exports.getWechat = () => new Wechat(wechatCfg.wechat)
exports.getOAuth = () => new WechatOAuth(wechatCfg.wechat)

// exports.test = async () => {
//     const client = new Wechat(wechatCfg.wechat)
//     const data = await client.fetchAccessToken()
//     console.log("数据库中获取的data")
//     console.log(data)
// }