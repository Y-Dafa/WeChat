const mongoose = require('mongoose')
const Category = mongoose.model('Category')
const Movie = mongoose.model('Movie')
const api = require('../api')

// 0. 电影分类 Model 创建
// 1. 电影分类的录入页面
exports.show = async (ctx, next) => {
  const { _id } = ctx.params
  let category = {}

  if (_id) {
    category = await api.movie.findCategoryById(_id)
  }
  console.log(category)
  await ctx.render('pages/category_admin', {
    title: '后台分类录入页面',
    category
  })
}

// 2. 电影分类的创建持久化
exports.new = async (ctx, next) => {
  const { name, _id } = ctx.request.body.category
  let category

  if (_id) {
    category = await api.movie.findCategoryById(_id)
  }

  if (category) {
    category.name = name
  } else {
    category = new Category({ name })
  }

  await category.save()
  console.log(category)
  ctx.redirect('/admin/category/list')
}

// 3. 电影分类的后台列表
exports.list = async (ctx, next) => {
  const categories = await api.movie.findCategories()

  await ctx.render('pages/category_list', {
    title: '分类的列表页面',
    categories
  })
}

exports.del = async (ctx, next) => {
  const id = ctx.query.id

  try {
    await Category.deleteOne({ _id: id })
    await Movie.deleteOne({
      category: id
    })
    ctx.body = { success: true }
  } catch (err) {
    ctx.body = { success: false }
  }
}
// 4. 对应的分类路由规则
// 5. 对应的分类页面
