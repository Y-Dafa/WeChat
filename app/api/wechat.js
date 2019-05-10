const mongoose = require('mongoose')
const User = mongoose.model('User')
const { getOAuth, getWechat } = require('../../wechat/index')
const util = require('../../wechat-lib/util')

exports.getSignature = async (url) => {
    const client = getWechat()
    const data = await client.fetchAccessToken()
    const token = data.access_token
    const ticketData = await client.fetchTicket(token)
    const ticket = ticketData.ticket

    let params = util.sign(ticket, url)
    params.appId = client.appID

    return params
}

exports.getAuthorizeURL = (scope, target, state) => {
    const oauth = getOAuth()
    const url = oauth.getAuthorizeURL(scope, target, state)

    return url
}

exports.getUserinfoByCode = async (code) => {
    const oauth = getOAuth()
    const data = await oauth.fetchAccessToken(code)
    const userData = await oauth.getUserInfo(data.access_token, data.openid)

    return userData
}

exports.saveWechatUser = async (userData) => {
    let query = {
        openid: userData.openid
    }

    if (userData.unionid) {
        query = {
            unionid: userData.unionid
        }
    }

    let user = await User.findOne(query)

    if (!user) {
        user = new User({
            openid: [userData.openid],
            unionid: userData.unionid,
            nickname: userData.nickname,
            email: (userData.unionid || userData.openid) + '@wx.com',
            province: userData.province,
            country: userData.country,
            city: userData.city,
            gender: userData.gender || userData.sex
        })

        console.log(user)

        user = await user.save()
    }

    return user
}

// 持久化用户
// 对用户打标签和统计
exports.saveMPUser = async (message, from = '') => {
    let sceneId = message.EventKey
    let openid = message.FromUserName
    let count = 0

    if (sceneId && sceneId.indexOf('qrscene_') > -1) {
        sceneId = sceneId.replace('qrscene_', '')
    }

    let user = await User.findOne({
        openid: openid
    })

    let mp = require('../../wechat/index')
    let client = mp.getWechat()
    let userInfo = await client.handle('getUserInfo', openid)

    if (sceneId === 'imooc') {
        from = 'imooc'
    }

    if (!user) {
        let userData = {
            from: from,
            openid: [userInfo.openid],
            unionid: userInfo.unionid,
            nickname: userInfo.nickname,
            email: (userInfo.unionid || userInfo.openid) + '@wx.com',
            province: userInfo.province,
            country: userInfo.country,
            city: userInfo.city,
            gender: userInfo.gender || userInfo.sex
        }

        console.log(userData)

        user = new User(userData)
        user = await user.save()
    }

    if (from === 'imooc') {
        let tagid

        count = await User.count({
            from: 'imooc'
        })

        try {
            let tagsData = await client.handle('fetchTags')

            tagsData = tagsData || {}
            const tags = tagsData.tags || []
            const tag = tags.filter(tag => {
                return tag.name === 'imooc'
            })

            if (tag && tag.length > 0) {
                tagid = tag[0].id
                count = tag[0].count || 0
            } else {
                let res = await client.handle('createTag', 'imooc')

                tagid = res.tag.id
            }

            if (tagid) {
                await client.handle('batchTag', [openid], tagid)
            }
        } catch (err) {
            console.log(err)
        }
    }

    return {
        user,
        count
    }
}
