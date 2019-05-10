const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TokenSchema = new Schema({
    name: String,
    token: String,
    expires_in: Number,
    meta: { 
        createdAt: {
            type: Date,
            default: Date.now()
        },
        updatedAt: {
            type: Date,
            default: Date.now()
        }
    }
})

//前置方法，在每一条数据存储之前都会执行这个方法
TokenSchema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createdAt = this.meta.updatedAt = Date.now()
    } else {
        this.updatedAt = Date.now()
    }
    next()
})

//静态方法
TokenSchema.statics = {
    async getAccessToken() {
        let token = await this.findOne({
            name: 'access_token'
        })

        if (token && token.token) {
            token.access_token = token.token
        }
        return token
    },
    async saveAccessToken() {
        let token = await this.findOne({
            name: 'access_token'
        })

        if (token) {
            token.token = data.access_token
            token.expires_in = data.expires_in
        } else {
            token = new Token({
                name: 'access_token',
                token: data.access_token,
                expires_in: data.expires_in,
            })
        }

        await token.save()
        return data
    }
}

const Token = mongoose.model('Token', TokenSchema)