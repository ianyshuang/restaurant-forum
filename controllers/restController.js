const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const moment = require('moment')

const pageLimit = 10

const restController = {
  getRestaurants: (req, res) => {
    let whereQuery = {}
    let categoryId = ''
    let offset = 0
    if (req.query.page) {
      offset = (Number(req.query.page) - 1) * pageLimit
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery['CategoryId'] = categoryId
    }
    Restaurant.findAndCountAll({ include: [Category], where: whereQuery, offset: offset, limit: pageLimit })
      .then(result => {
        let page = Number(req.query.page) || 1
        let totalPages = Math.ceil(result.count / pageLimit)
        let prev = page - 1 < 1 ? 1 : page - 1
        let next = page + 1 > totalPages ? totalPages : page + 1

        const data = result.rows.map(restaurant => ({
          ...restaurant.dataValues,
          description: restaurant.dataValues.description.substring(0, 50),
          isFavorite: req.user.FavoritedRestaurants.map(item => item.id).includes(restaurant.id),
          isLiked: req.user.LikedRestaurants.map(item => item.id).includes(restaurant.id)
        }))
        Category.findAll()
          .then(categories => {
            res.render('restaurants.pug', { 
              restaurants: data,
              categories,
              categoryId,
              page,
              totalPages,
              prev,
              next
            })
          })
      })
  },
  getRestaurant: (req, res) => {
    Restaurant.findByPk(req.params.id,{
      include: [
        Category,
        { model: Comment, include: [User] },
        { model: User, as: 'FavoritedUsers'},
        { model: User, as: 'LikedUsers' }
      ]
    })
      .then(restaurant => {
        restaurant.increment('viewCounts', { by: 1 })
        restaurant.Comments.forEach(comment => {
          comment.dataValues.createdAt = moment(comment.dataValues.createdAt).fromNow()
        })
        const isFavorite = restaurant.FavoritedUsers.map(item => item.id).includes(req.user.id)
        const isLiked = restaurant.LikedUsers.map(item => item.id).includes(req.user.id)
        return res.render('restaurant.pug', { restaurant, isFavorite, isLiked })
      })
  },
  getFeeds: async (req, res) => {
    const restaurants = await Restaurant.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [Category]
    })
    restaurants.forEach(restaurant => {
      restaurant.dataValues.createdAt = moment(restaurant.dataValues.createdAt).fromNow()
    })
    const comments = await Comment.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [User, Restaurant]
    })
    comments.forEach(comment => {
      comment.dataValues.createdAt = moment(comment.dataValues.createdAt).fromNow()
    })
    return res.render('feeds.pug', { restaurants, comments })
  },
  getDashboard: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [Category, Comment]
    }).then(restaurant => res.render('dashboard.pug', {restaurant}))
  }
}

module.exports = restController