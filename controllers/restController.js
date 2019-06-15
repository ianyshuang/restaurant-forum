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
          description: restaurant.dataValues.description.substring(0, 50)
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
        { model: Comment, include: [User] }
      ]
    })
      .then(restaurant => {
        restaurant.Comments.forEach(comment => {
          comment.dataValues.createdAt = moment(comment.dataValues.createdAt).fromNow()
        })
        return res.render('restaurant.pug', { restaurant })
      })
  }
}

module.exports = restController