const { reply } = require('../../wechat/reply')
const config = require('../../config/config')
const api = require('../api/index')
const wechatMiddle = require('../../wechat-lib/middleware')

exports.getSDKSignature = async (ctx, next) => {
    let url = ctx.query.url

    url = decodeURIComponent(url)

    const params = await api.wechat.getSignature(url)

    ctx.body = {
        success: true,
        data: params
    }
}

// 接入SDK中间件
exports.sdk = async (ctx, next) => {
    const url = ctx.href
    const params = await api.wechat.getSignature(url)

    await ctx.render('wechat/sdk', params)
}

// 接入微信消息中间件
exports.hear = async (ctx, next) => {
    const middle = wechatMiddle(config.wechat, reply)

    await middle(ctx, next)
}

// 接入网页授权中间件
exports.oauth = async (ctx, next) => {
    const state = ctx.query.id
    const scope = 'snsapi_userinfo'
    const target = config.baseUrl + 'userinfo'
    const url = api.wechat.getAuthorizeURL(scope, target, state)

    ctx.redirect(url)
}
// 接入用户消息中间件
exports.userinfo = async (ctx, next) => {
    const userData = await api.wechat.getUserinfoByCode(ctx.query.code)

    ctx.body = userData
}

function isWechat(ua) {
    if (ua.indexOf('MicroMessenger') >= 0) {
        return true
    } else {
        return false
    }
}
// 接入微信验证中间件
exports.checkWechat = async (ctx, next) => {
    const ua = ctx.headers['user-agent']
    const code = ctx.query.code

    // 所有的网页请求都会流经这个中间件，包括微信的网页访问
    // 针对 POST 非 GET 请求，不走用户授权流程
    if (ctx.method === 'GET') {
        // 如果参数带 code，说明用户已经授权
        if (code) {
            await next()
            // 如果没有 code，且来自微信访问，就可以配置授权的跳转
        } else if (isWechat(ua)) {
            const target = ctx.href  //当前地址
            const scope = 'snsapi_userinfo'
            //目标跳转地址
            const url = api.wechat.getAuthorizeURL(scope, target, 'fromWechat')

            //重定向到需要用户授权的中间地址
            ctx.redirect(url)
        } else {
            await next()
        }
    } else {
        await next()
    }
}
// 接入微信重定向中间件
exports.wechatRedirect = async (ctx, next) => {
    const { code, state } = ctx.query

    if (code && state === 'fromWechat') {
        //经过用户授权且跳转成功
        const userData = await api.wechat.getUserinfoByCode(code)
        const user = await api.wechat.saveWechatUser(userData)

        //同步当前登录状态
        ctx.session.user = {
            _id: user._id,
            role: user.role,
            nickname: user.nickname
        }

        //将用户信息状态同步到当前渲染模板引擎的一个变量里，
        ctx.state = Object.assign(ctx.state, {
            user: {
                _id: user._id,
                role: user.role,
                nickname: user.nickname
            }
        })
    }

    await next()
}
