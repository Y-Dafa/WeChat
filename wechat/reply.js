const { resolve } = require('path')
const config = require('../config/config')
const commonMenu = require('./menu')
const api = require('../app/api/index')

const help = '亲爱的，欢迎关注时光的余热\n' +
    '回复 1-3，测试文字回复\n' +
    '回复 4，测试图片回复\n' +
    '回复 首页，进入网站首页\n' +
    '回复 电影名字，查询电影信息\n' +
    '点击帮助，获取帮助信息\n' +
    '某些功能呢订阅号无权限，比如网页授权\n' +
    '回复语音，查询电影信息\n' +
    '也可以点击 <a href="' + config.baseUrl + '/sdk">语音查电影</a>，查询电影信息\n'

exports.reply = async (ctx, next) => {
    const message = ctx.weixin
    let mp = require('./index')
    let client = mp.getWechat()

    if (message.MsgType === 'voice') {
        let content = message.Recognition
        let reply = ''
        let movies = await api.movie.searchByKeyword(content)
        reply = []

        if (!movies || movies.length === 0) {
            let catData = await api.movie.findMoviesByCat(content)

            if (catData) {
                movies = catData.movies
            }
        }

        if (!movies || movies.length === 0) {
            movies = await api.movie.searchByDouban(content)
        }

        if (!movies || movies.length) {
            movies = movies.slice(0, 4)

            movies.forEach(movie => {
                reply.push({
                    title: movie.title,
                    description: movie.summary,
                    picUrl: movie.poster.indexOf('http') > -1 ? movie.poster : (config.baseUrl + '/upload/' + movie.poster),
                    url: config.baseUrl + '/movie/' + movie._id
                })
            })
        } else {
            reply = '没有查询到与 ' + content + ' 相关的电影，要不要换一个名字试试看哦！'
        }

        ctx.body = reply
    } if (message.MsgType === 'image') {
        console.log(message.PicUrl)
    } else if (message.MsgType === 'event') {  //解析POST消息配置回复策略
        let reply = ''
        if (message.Event === 'subscribe') {
            reply = '欢迎订阅' + '！ '
            if (message.EventKey && message.ticket) {
                reply += '扫码参数是：' + message.EventKey + '_' + message.ticket
            } else {
                reply = help
            }
        } else if (message.Event === 'unsubscribe') {
            reply = '无情取消订阅'
        } else if (message.Event === 'SCAN') {
            console.log('关注后扫二维码' + '！ 扫码参数' + message.EventKey + '_' + message.ticket)
        } else if (message.Event === 'LOCATION') {
            console.log(`您上报的位置是：${message.Latitude}-${message.Longitude}-${message.Precision}`)
        } else if (message.Event === 'CLICK') {
            if (message.EventKey === 'help') {
                reply = help
            } else if (message.EventKey === 'movie_hot') {
                let movies = await api.movie.findHotMovies(-1, 4)
                reply = []

                movies.forEach(movie => {
                    reply.push({
                        title: movie.title,
                        description: movie.summary,
                        picUrl: movie.poster.indexOf('http') > -1 ? movie.poster : (config.baseUrl + '/upload/' + movie.poster),
                        url: config.baseUrl + '/movie/' + movie._id
                    })
                })
            } else if (message.EventKey === 'movie_cold') {
                let movies = await api.movie.findHotMovies(1, 4)
                reply = []

                movies.forEach(movie => {
                    reply.push({
                        title: movie.title,
                        description: movie.summary,
                        picUrl: movie.poster.indexOf('http') > -1 ? movie.poster : (config.baseUrl + '/upload/' + movie.poster),
                        url: config.baseUrl + '/movie/' + movie._id
                    })
                })
            } else if (message.EventKey === 'movie_sci') {
                let catData = await api.movie.findMoviesByCat('科幻')
                let movies = catData.movies || []
                reply = []

                movies = movies.slice(0, 6)
                movies.forEach(movie => {
                    reply.push({
                        title: movie.title,
                        description: movie.summary,
                        picUrl: movie.poster.indexOf('http') > -1 ? movie.poster : (config.baseUrl + '/upload/' + movie.poster),
                        url: config.baseUrl + '/movie/' + movie._id
                    })
                })
            } else if (message.EventKey === 'movie_love') {
                //catData是一个对象
                let catData = await api.movie.findMoviesByCat('爱情')
                let movies = catData.movies || []
                reply = []

                movies.forEach(movie => {
                    reply.push({
                        title: movie.title,
                        description: movie.summary,
                        picUrl: movie.poster.indexOf('http') > -1 ? movie.poster : (config.baseUrl + '/upload/' + movie.poster),
                        url: config.baseUrl + '/movie/' + movie._id
                    })
                })
            } else if (message.EventKey === 'movie_ani') {
                let catData = await api.movie.findMoviesByCat('动画')
                let movies = catData.movies || []
                reply = []

                movies = movies.slice(0, 6)
                movies.forEach(movie => {
                    reply.push({
                        title: movie.title,
                        description: movie.summary,
                        picUrl: movie.poster.indexOf('http') > -1 ? movie.poster : (config.baseUrl + '/upload/' + movie.poster),
                        url: config.baseUrl + '/movie/' + movie._id
                    })
                })
            }
            console.log('你点击了菜单的： ' + message.EventKey)
        } else if (message.Event === 'VIEW') {
            console.log('你点击了菜单链接： ' + message.EventKey + ' ' + message.MenuId)
        } else if (message.Event === 'scancode_push') {
            console.log('你扫码了： ' + message.ScanCodeInfo.ScanType + ' ' + message.ScanCodeInfo.ScanResult)
        } else if (message.Event === 'scancode_waitmsg') {
            console.log('你扫码了： ' + message.ScanCodeInfo.ScanType + ' ' + message.ScanCodeInfo.ScanResult)
        } else if (message.Event === 'pic_sysphoto') {
            console.log('系统拍照： ' + message.SendPicsInfo.count + ' ' + JSON.stringify(message.SendPicsInfo.PicList))
        } else if (message.Event === 'pic_photo_or_album') {
            console.log('拍照或者相册： ' + message.SendPicsInfo.count + ' ' + JSON.stringify(message.SendPicsInfo.PicList))
        } else if (message.Event === 'pic_weixin') {
            console.log('微信相册发图： ' + message.SendPicsInfo.count + ' ' + JSON.stringify(message.SendPicsInfo.PicList))
        } else if (message.Event === 'location_select') {
            console.log('地理位置： ' + JSON.stringify(message.SendLocationInfo))
        }

        ctx.body = reply
    } else if (message.MsgType === 'text') {
        let content = message.Content
        let reply = 'Oh,你说的' + content + '太复杂了，无法解析！'

        if (content === 'special') {
            const countData = await api.wechat.saveMPUser(message, 'special')
            const user = countData.user
            const count = countData.count
            let nickname = user.nickname || ''

            if (user.gender === '1') {
                nickname = `小哥哥 - ${nickname}`
            } else if (user.gender === '2') {
                nickname = `小姐姐 - ${nickname}`
            }

            let guess = '我猜不出你来自哪里，'

            if (user.province || user.city) {
                guess = `我猜你来自${user.province}省，${user.city}市，`
            }

            let end = `${guess}哈哈，这些信息只有你关注我才能从微信服务器拿到，感谢您的关注！`

            reply = `嗨咯！${nickname}，你有 ${count} 个小伙伴和你一样关注了该公众号哟！${end}`
        } else if (content === '1') {
            reply = 'The first word'
        } else if (content === '2') {
            reply = 'The second word'
        } else if (content === '3') {
            reply = 'The third word'
        } else if (content === '4') {
            let data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../2.jpg'))
            reply = {
                type: 'image',
                mediaId: data.media_id
            }
        } else if (content === '5') {
            let data = await client.handle('uploadMaterial', 'video', resolve(__dirname, '../6.mp4'))
            reply = {
                type: 'video',
                title: '回复的视频标题',
                description: '打个篮球玩玩',
                mediaId: data.media_id
            }
        } else if (content === '6') {
            let data = await client.handle('uploadMaterial', 'video', resolve(__dirname, '../6.mp4'), {
                type: 'video',
                description: '{"title": "这个地方很棒", "introduction": "精彩视频"}'
            })

            reply = {
                type: 'video',
                title: '精彩小视频',
                description: '打个篮球玩玩',
                mediaId: data.media_id
            }
        } else if (content === '7') {
            let data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../2.jpg'), {
                type: 'image'
            })

            reply = {
                type: 'image',
                mediaId: data.media_id
            }
        } else if (content === '8') {
            let data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../2.jpg'), {
                type: 'image'
            })
            let data2 = await client.handle('uploadMaterial', 'pic', resolve(__dirname, '../2.jpg'), {
                type: 'image'
            })
            console.log(data2)

            let media = {
                articles: [
                    {
                        title: '这是服务端上传的图文 1',
                        thumb_media_id: data.media_id,
                        author: 'Scott',
                        digest: '没有摘要',
                        show_cover_pic: 1,
                        content: '点击查看详细内容',
                        content_source_url: 'http://coding.imooc.com/'
                    }, {
                        title: '这是服务端上传的图文 2',
                        thumb_media_id: data.media_id,
                        author: 'Dafa',
                        digest: '没有摘要',
                        show_cover_pic: 1,
                        content: '点击去往 github',
                        content_source_url: 'http://github.com/'
                    }
                ]
            }

            let uploadData = await client.handle('uploadMaterial', 'news', media, {})

            let newMedia = {
                media_id: uploadData.media_id,
                index: 0,
                articles: {
                    title: '这是服务端上传的图文 1',
                    thumb_media_id: data.media_id,
                    author: 'Dafa',
                    digest: '没有摘要',
                    show_cover_pic: 1,
                    content: '点击查看详细内容',
                    content_source_url: 'http://coding.imooc.com/'
                }
            }

            console.log(uploadData)

            let mediaData = await client.handle('updateMaterial', uploadData.media_id, newMedia)

            console.log(mediaData)

            let newsData = await client.handle('fetchMaterial', uploadData.media_id, 'news', true)
            let items = newsData.news_item
            let news = []

            items.forEach(item => {
                news.push({
                    title: item.title,
                    description: item.description,
                    picUrl: data2.url,
                    url: item.url
                })
            })

            reply = news
        } else if (content === '9') {
            let counts = await client.handle('countMaterial')
            console.log(JSON.stringify(counts))

            let res = await Promise.all([
                client.handle('batchMaterial', {
                    type: 'image',
                    offset: 0,
                    count: 10
                }),
                client.handle('batchMaterial', {
                    type: 'video',
                    offset: 0,
                    count: 10
                }),
                client.handle('batchMaterial', {
                    type: 'voice',
                    offset: 0,
                    count: 10
                }),
                client.handle('batchMaterial', {
                    type: 'news',
                    offset: 0,
                    count: 10
                })
            ])

            console.log(res)

            reply = `
              image: ${res[0].total_count}
              video: ${res[1].total_count}
              voice: ${res[2].total_count}
              news: ${res[3].total_count}
            `
        } else if (content === '10') {
            // 创建标签
            // let newTag = await client.handle('createTag', 'imooc')
            // console.log(newTag)
            // 删除标签
            // await client.handle('delTag', 100)
            // 编辑标签
            // await client.handle('updateTag', 101, '慕课网')
            // 批量打标签/取消标签
            await client.handle('batchTag', [message.FromUserName], 101, true)
            // 获取某个标签的用户列表
            let userList = await client.handle('fetchTagUsers', 2)
            console.log(userList)
            // 获取公众号的标签列表
            let tagsData = await client.handle('fetchTags')
            // 获取某个用户的标签列表
            // let userTags = await client.handle('getUserTags', message.FromUserName)

            reply = tagsData.tags.length
        } else if (content === '11') {
            let userList = await client.handle('fetchUserList')

            console.log(userList)

            reply = userList.total + ' 个关注者'
        } else if (content === '12') {
            await client.handle('remarkUser', message.FromUserName, '')
            reply = '改名成功'
        } else if (content === '13') {
            let userInfoData = await client.handle('getUserInfo', message.FromUserName)

            console.log(userInfoData)

            reply = JSON.stringify(userInfoData)
        } else if (content === '14') {
            let batchUsersInfo = await client.handle('fetchBatchUsers', [{
                openid: message.FromUserName,
                lang: 'zh_CN'
            }, {
                openid: 'oh6d056SxeYX8_bwolAz5t8RoA_s',
                lang: 'zh_CN'
            }])

            console.log(batchUsersInfo)

            reply = JSON.stringify(batchUsersInfo)
        } else if (content === '15') {
            //生成临时二维码
            // let tempQrData = {
            //     expire_seconds: 400000,
            //     action_name: 'QR_SCENE',
            //     action_info: {
            //         scene: {
            //             scene_id: 101
            //         }
            //     }
            // }
            // let tempTicketData = await client.handle('createQrcode', tempQrData)
            // console.log(tempTicketData)
            // let tempQr = client.showQrcode(tempTicketData.ticket)
            // console.log(tempQr)
            // reply = tempQr
            //生成永久二维码
            let qrData = {
                action_name: 'QR_SCENE',
                action_info: {
                    scene: {
                        scene_id: 99
                    }
                }
            }
            let ticketData = await client.handle('createQrcode', qrData)
            console.log(ticketData)
            let qr = client.showQrcode(ticketData.ticket)
            console.log(qr)

            reply = qr
        } else if (content === '16') {
            let longurl = 'https://mp.weixin.qq.com/wiki?t=resource'
            let shortData = await client.handle('createShortUrl', 'long2short', longurl)

            console.log(shortData)

            reply = shortData.short_url
        } else if (content === '17') {
            let semanticData = {
                query: '查一下明天从杭州到北京的南航机票',
                city: '杭州',
                category: 'flight,hotel',
                uid: message.FromUserName
            }
            let searchData = await client.handle('semantic', semanticData)

            console.log(searchData)

            reply = JSON.stringify(searchData)
        } else if (content === '18') {
            let body = '编程语言难学么'
            let aiData = await client.handle('aiTranslate', body, 'zh_CN', 'en_US')

            console.log(aiData)

            reply = JSON.stringify(aiData)
        } else if (content === '19') {
            try {
                let delData = await client.handle('deleteMenu')
                console.log(delData)
                let menu = {
                    button: [{
                        name: '一级菜单',
                        sub_button: [{
                            name: '二级菜单 1',
                            type: 'click',
                            key: 'no_1'
                        }, {
                            name: '二级菜单 2',
                            type: 'click',
                            key: 'no_2'
                        }, {
                            name: '二级菜单 3',
                            type: 'click',
                            key: 'no_3'
                        }, {
                            name: '二级菜单 4',
                            type: 'click',
                            key: 'no_4'
                        }, {
                            name: '二级菜单 5',
                            type: 'click',
                            key: 'no_5'
                        }]
                    },
                    {
                        name: '分类',
                        type: 'view',
                        url: 'https://www.imooc.com'
                    },
                    {
                        name: '新菜单_' + Math.random(),
                        type: 'click',
                        key: 'new_111'
                    }
                    ]
                }
                let createData = await client.handle('createMenu', menu)
                console.log(createData)
            } catch (e) {
                console.log(e)
            }

            reply = '菜单创建成功，请等 5 分钟，或者先取消关注，再重新关注就可以看到新菜单'
        } else if (content === '20') {
            try {
                // let delData = await client.handle('deleteMenu')
                let menu = {
                    button: [{
                        name: 'Scan_Photo',
                        sub_button: [{
                            name: '系统拍照',
                            type: 'pic_sysphoto',
                            key: 'no_1'
                        }, {
                            name: '拍照或者发图',
                            type: 'pic_photo_or_album',
                            key: 'no_2'
                        }, {
                            name: '微信相册发布',
                            type: 'pic_weixin',
                            key: 'no_3'
                        }, {
                            name: '扫码',
                            type: 'scancode_push',
                            key: 'no_4'
                        }, {
                            name: '等待中扫码',
                            type: 'scancode_waitmsg',
                            key: 'no_5'
                        }]
                    },
                    {
                        name: '跳新链接',
                        type: 'view',
                        url: 'https://www.imooc.com'
                    },
                    {
                        name: '其他',
                        sub_button: [{
                            name: '点击',
                            type: 'click',
                            key: 'no_11'
                        }, {
                            name: '地理位置',
                            type: 'location_select',
                            key: 'no_12'
                        }]
                    }
                    ]
                }
                let rules = {
                    // "tag_id": "2",
                    // "sex": "1",
                    // "country": "中国",
                    // "province": "广东",
                    // "city": "广州",
                    // "client_platform_type": "2",
                    language: 'en'
                }
                await client.handle('createMenu', menu, rules)
            } catch (e) {
                console.log(e)
            }

            let menus = await client.handle('fetchMenu')

            console.log(JSON.stringify(menus))

            reply = '菜单创建成功，请等 5 分钟，或者先取消关注，再重新关注就可以看到新菜单'
        } else if (content === '更新菜单') {
            try {
                await client.handle('deleteMenu')
                await client.handle('createMenu', commonMenu)
            } catch (e) {
                console.log(e)
            }

            reply = '菜单创建成功，请等 5 分钟，或者先取消关注，再重新关注就可以看到新菜单'
        } else if (content === '首页') {
            reply = [{
                title: '时光的余热',
                description: '匆匆岁月时光去，这里有你走过的痕迹',
                picUrl: 'https://imoocday7.oss-cn-beijing.aliyuncs.com/WX20180701-224844.png',
                url: config.baseUrl
            }]
        } else {
            let movies = await api.movie.searchByKeyword(content)
            reply = []

            if (!movies || movies.length === 0) {
                let catData = await api.movie.findMoviesByCat(content)

                if (catData) {
                    movies = catData.movies
                }
            }

            if (!movies || movies.length === 0) {
                movies = await api.movie.searchByDouban(content)
            }

            if (!movies || movies.length) {
                movies = movies.slice(0, 4)

                movies.forEach(movie => {
                    reply.push({
                        title: movie.title,
                        description: movie.summary,
                        picUrl: movie.poster.indexOf('http') > -1 ? movie.poster : (config.baseUrl + '/upload/' + movie.poster),
                        url: config.baseUrl + '/movie/' + movie._id
                    })
                })
            } else {
                reply = '没有查询到与 ' + content + ' 相关的电影，要不要换一个名字试试看哦！'
            }
        }

        ctx.body = reply
    }
    await next()
}