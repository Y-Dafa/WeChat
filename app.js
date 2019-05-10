const Koa = require('koa')
const views = require('koa-views')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const session = require('koa-session')
const serve = require('koa-static')
const { resolve } = require('path')
const mongoose = require('mongoose')
const moment = require('moment')
const config = require('./config/config')
const { initSchemas, connect } = require('./app/database/init')

	;
(async () => {
	await connect(config.db)
	initSchemas()
	//测试token的数据库存储，在Schema封装好后再引入test
	// const { test } = require('./wechat/index')
	// await test()
	//生成服务器实例
	const app = new Koa()
	//生成路由实例
	const router = new Router()

	app.use(views(resolve(__dirname, 'app/views'), {
		extension: 'pug',
		options: {
			moment: moment
		}
	}))

	app.keys = ['weixin']
	app.use(session(app))
	app.use(bodyParser())
	app.use(serve(resolve(__dirname, '../public')))

	// 植入两个中间件，做前置的微信环境检查、跳转、回调的用户数据存储和状态同步
	const wechatController = require('./app/controllers/wechat')

	app.use(wechatController.checkWechat)
	app.use(wechatController.wechatRedirect)

	app.use(async (ctx, next) => {
		const User = mongoose.model('User')
		let user = ctx.session.user

		if (user && user._id) {
			user = await User.findOne({ _id: user._id })
			if (user) {
				ctx.session.user = {
					_id: user._id,
					role: user.role,
					nickname: user.nickname
				}
				ctx.state = Object.assign(ctx.state, {
					user: {
						_id: user._id,
						nickname: user.nickname
					}
				})
			}
		} else {
			ctx.session.user = null
		}

		await next()
	})

	require('./config/routes')(router)
	app.use(router.routes()).use(router.allowedMethods())
	app.listen(3008)
	console.log('项目开启')
})()
