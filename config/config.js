const { resolve } = require('path')
const isProd = process.env.NODE_ENV === 'production'

let cfg = {
    port: 3008,
    db: 'mongodb://localhost:27017/wechat',
    wechat: {
        appID: 'wx17dbc006f97fb7b4',
        appSecret: 'f4262d88566e6041617c38a73f21cfd4',
        token: 'dafawechat19960529project'
    },
    baseUrl: 'http://hdafa.vipgz1.idcfengye.com/'
}

if (isProd) {
    const config = require(resolve(__dirname, '../../../../config/config.json'))

    cfg = Object.assign(cfg, config)
}

module.exports = cfg