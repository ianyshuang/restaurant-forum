const db = require('../../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category

const adminService = require('../../services/adminService')

const adminController = {
  getRestaurants (req, res)  {
    adminService.getRestaurants(req, res, (data) => { res.json(data) })
  },
  getRestaurant (req, res) {
    adminService.getRestaurant(req, res, (data) => { res.json(data) })
  },
  getCategories (req, res) {
    adminService.getCategories(req, res, (data) => { res.json(data) })
  }
}

module.exports = adminController
