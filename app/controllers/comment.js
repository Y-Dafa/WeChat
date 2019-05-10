const mongoose = require('mongoose')
const Comment = mongoose.model('Comment')

exports.save = async (ctx, next) => {
    const commentData = ctx.request.body.comment

    if (commentData.cid) {
        let comment = await Comment.findOne({
            _id: commentData.cid
        })

        const reply = {
            from: commentData.from,
            to: commentData.tid,
            content: commentData.content
        }

        comment.replies.push(reply)

        await comment.save()

        ctx.body = { success: true }
    } else {
        let comment = new Comment({
            movie: commentData.movie,
            from: commentData.from,
            content: commentData.content
        })

        await comment.save()

        ctx.body = { success: true }
    }
}
