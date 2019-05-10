// 1. 用户访问网页 /a
// 2. 服务器构建二跳网页地址 /b?state&appid 各种参数追加
// 3. 跳到微信授权页，用户主动授权，跳回来到 /a?code
// 4. 通过 code 换取 token code => wechat => access_token, openid
// 5. 通过 token + openid 换取资料 access_token => 用户资料
const request = require('request-promise')
const base = 'https://api.weixin.qq.com/sns/'
const api = {
    authorize: 'https://open.weixin.qq.com/connect/oauth2/authorize?',
    accessToken: base + 'oauth2/access_token?',
    userInfo: base + 'userinfo?'
}
module.exports = class WechatOAuth {
    constructor(opts) {
        this.appID = opts.appID
        this.appSecret = opts.appSecret
    }

    async request(options) {
        options = Object.assign({}, options, { json: true })

        try {
            const res = await request(options)

            return res
        } catch (err) {
            console.log(err)
        }
    }

    //拼装二跳地址获取code 
    // 详细信息/主动授权： snsapi_userinfo
    // 基本信息/静默授权： snsapi_base
    getAuthorizeURL(scope = 'snsapi_base', target, state) {
        const url = `${api.authorize}appid=${this.appID}&redirect_uri=${encodeURIComponent(target)}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`

        return url
    }

    async fetchAccessToken(code) {
        const url = `${api.accessToken}appid=${this.appID}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`

        const res = await this.request({ url })

        return res
    }

    async getUserInfo(token, openID, lang = 'zh_CN') {
        const url = `${api.userInfo}access_token=${token}&openid=${openID}&lang=${lang}`
        console.log(url)
        const res = await this.request({ url })

        return res
    }
}
