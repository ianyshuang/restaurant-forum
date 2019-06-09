const db = require('../models')
const Restaurant = db.Restaurant

const adminController = {
  getRestaurants: (req, res) => {
    Restaurant.findAll()
      .then(restaurants => res.render('admin/restaurants', { restaurants }))
  },
  createRestaurant: (req, res) => {
    return res.render('admin/create')
  },
  postRestaurant: (req, res) => {
    const { name, tel, address, opening_hours, description } = req.body
    if (!name) {
      req.flash('error_msg', '請填寫餐廳名稱！')
      return res.redirect('back')
    }

    return Restaurant.create({
      name,
      tel,
      address,
      opening_hours,
      description
    })
      .then(restaurant => {
        req.flash('success_msg', '成功新增餐廳！')
        res.redirect('/admin/restaurants')
      })
  },
  getRestaurant: (req, res) => {
    Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        res.render('admin/restaurant', { restaurant })
      })
  },
  editRestaurant: (req, res) => {
    Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        // 與 create 共用同一個 view
        res.render('admin/create', { restaurant })
      })
  },
  putRestaurant: (req, res) => {
    const { name, tel, address, opening_hours, description } = req.body
    if (!name) {
      req.flash('error_msg', '請填寫餐廳名稱！')
      return res.redirect('back')
    } else {
      Restaurant.findByPk(req.params.id)
        .then(restaurant => {
          return restaurant.update({
            name,
            tel,
            address,
            opening_hours,
            description
          })
        })
        .then(restaurant => {
          req.flash('success_msg', '成功更新餐廳資料！')
          res.redirect('/admin/restaurants')
        })
    }
  },
  deleteRestaurant: (req, res) => {
    Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        return restaurant.destroy()
      })
      .then(restaurant => {
        return res.redirect('/admin/restaurants')
      })
  }
}

module.exports = adminController