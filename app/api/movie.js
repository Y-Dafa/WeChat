const mongoose = require('mongoose')
const Category = mongoose.model('Category')
const Movie = mongoose.model('Movie')
const rp = require('request-promise')
const _ = require('lodash')

const updateMovies = async (movie) => {
    const options = {
        uri: `https://api.douban.com/v2/movie/subject/${movie.doubanId}`,
        json: true
    }

    const data = await rp(options)

    _.extend(movie, {
        country: data.countries[0],
        language: data.language,
        summary: data.summary
    })

    //豆瓣电影的分类名
    const genres = movie.genres

    if (genres && genres.length) {
        try {
            await Promise.all(genres.forEach(async genre => {
                let cat = await Category.findOne({
                    name: genre
                })

                if (cat) {
                    cat.movies.push(movie._id)

                    await cat.save()
                } else {
                    cat = new Category({
                        name: genre,
                        movies: [movie._id]
                    })

                    cat = await cat.save()
                    movie.category = cat._id
                    await movie.save()
                }
            }))
        } catch{
            console.log('1')
        }

    } else {
        movie.save()
    }
}

exports.searchByDouban = async (q) => {
    const options = {
        uri: `https://api.douban.com/v2/movie/search?q=${encodeURIComponent(q)}`,
        json: true
    }

    const data = await rp(options)
    let subjects = []
    let movies = []

    if (data && data.subjects) {
        subjects = data.subjects
    }

    if (subjects.length) {
        await Promise.all(subjects.map(async item => {
            let movie = await Movie.findOne({
                doubanId: item.id
            })

            if (movie) {
                movies.push(movie)
            } else {
                const directors = item.directors || []
                const director = directors[0] || {}

                movie = new Movie({
                    title: item.title,
                    director: director.name,
                    doubanId: item.id,
                    year: item.year,
                    genres: item.genres || [],
                    poster: item.images.large
                })

                movie = await movie.save()

                movies.push(movie)
            }
        }))

        movies.forEach(movie => {
            updateMovies(movie)
        })
    }

    return movies
}

exports.findMoviesByCat = async (cat) => {
    const data = await Category.findOne({
        name: cat
    })
        .populate({
            path: 'movies',
            select: '_id title poster summary'
        })

    return data
}

exports.findHotMovies = async (hot, count) => {
    //hot为-1从大到小排，1从小到大排
    const data = await Movie.find({}).sort({
        pv: hot
    }).limit(count)

    return data
}

exports.searchByCategroy = async (catId) => {
    const data = await Category.find({
        _id: catId
    }).populate({
        path: 'movies',
        select: '_id title poster',
        options: { limit: 8 }
    })

    return data
}

exports.searchByKeyword = async (q) => {
    const data = await Movie.find({
        title: new RegExp(q + '.*', 'i')
    })

    return data
}

exports.findMovieById = async (id) => {
    const data = await Movie.findOne({
        _id: id
    })

    return data
}

exports.findMoviesAndCategory = async (fields) => {
    const data = await Movie.find({
    }).populate('category', fields)

    return data
}

exports.findCategoryById = async (id) => {
    const data = await Category.findOne({
        _id: id
    })

    return data
}

exports.findCategories = async (id) => {
    const data = await Category.find({})

    return data
}
