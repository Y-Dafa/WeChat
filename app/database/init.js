const mongoose = require('mongoose')
const { resolve } = require('path')
const glob = require('glob')

mongoose.Promise = global.Promise

exports.initSchemas = () => {
    //引入所有schema文件
    glob.sync(resolve(__dirname, './schema', '**/*.js')).forEach(require)
}

exports.connect = (db) => {
    return new Promise(resolve => {
        mongoose.connect(db, { useNewUrlParser: true, useCreateIndex: true })
        mongoose.connection.on('disconnect', () => {
            console.log('数据库连接失败！')
        })
        mongoose.connection.on('error', err => {
            console.log(err)
        })
        mongoose.connection.on('open', () => {
            resolve()
            console.log('Mongodb connected!')
        })
    })
}