const sha1 = require('sha1')
const getRawBody = require('raw-body')//用来接收原始数据的一个库
const util = require('./util')

module.exports = (config, reply) => {
    return async (ctx, next) => {
        const {
            signature,
            timestamp,
            nonce,
            echostr,
        } = ctx.query
        const token = config.token
        let str = [token, timestamp, nonce].sort().join('')
        const sha = sha1(str)

        //判断请求方式如果是GET就是过来认证的如果是POST就是推送过来的消息
        if (ctx.method === 'GET') {
            if (sha === signature) {
                ctx.body = echostr
            } else {
                ctx.body = 'Failed'
            }
        } else if (ctx.method === 'POST') {
            if (sha !== signature) {
                return (ctx.body = 'Failed')
            }

            //获取post过来的原始数据
            //getRawBody()返回一个promise对象所以可以用await来接收
            const data = await getRawBody(ctx.req, {
                length: ctx.length,
                limit: '1mb',
                encoding: ctx.charset,
            })

            //解析XML数据包
            const content = await util.parseXML(data)
            const message = util.formatMessage(content.xml)

            ctx.weixin = message
            //用apply让reply能拿到ctx和next
            await reply.apply(ctx, [ctx, next])

            const replyBody = ctx.body
            const msg = ctx.weixin
            const xml = util.tpl(replyBody, msg)

            ctx.status = 200
            ctx.type = 'application/xml'
            ctx.body = xml
        }

    }
}