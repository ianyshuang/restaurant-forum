const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = require('../services/adminService')

const adminController = {
  // user controller actions
  editUser: (req, res) => {
    User.findAll()
      .then(users => res.render('admin/users', { users }))
  },
  putUser: (req, res) => {
    User.findByPk(req.params.id)
      .then(user => {
        user.isAdmin = user.isAdmin ? 0 : 1
        user.save()
        req.flash('success_msg', '成功修改使用者權限！')
        return res.redirect('/admin/users')
      })
  },
  // restaurant controller actions
  getRestaurants (req, res) {
    adminService.getRestaurants(req, res, (data) => { res.render('admin/restaurants', data) })
  },
  createRestaurant: (req, res) => {
    Category.findAll()
      .then(categories => res.render('admin/create', { categories }))
  },
  postRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash('error_msg', "請填寫餐廳名稱！")
      return res.redirect('back')
    }

    const { file } = req // 從 req.file 中拿出來
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: file ? img.data.link : null,
          CategoryId: req.body.categoryId
        }).then((restaurant) => {
          req.flash('success_msg', '成功新增餐廳！')
          return res.redirect('/admin/restaurants')
        })
      })
    }
    else {
      return Restaurant.create({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hours,
        description: req.body.description,
        image: null,
        CategoryId: req.body.categoryId
      }).then((restaurant) => {
        req.flash('success_msg', '成功新增餐廳！')
        return res.redirect('/admin/restaurants')
      })
    }
  },
  getRestaurant (req, res) {
    adminService.getRestaurant(req, res, (data) => { res.render('admin/restaurant', data) })
  },
  editRestaurant: (req, res) => {
    Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        Category.findAll()
          // 與 create 共用同一個 view
          .then(categories => res.render('admin/create', { restaurant, categories }))
      })
  },
  putRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash('error_msg', "請輸入餐廳名稱！")
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id)
          .then((restaurant) => {
            restaurant.update({
              name: req.body.name,
              tel: req.body.tel,
              address: req.body.address,
              opening_hours: req.body.opening_hours,
              description: req.body.description,
              image: file ? img.data.link : restaurant.image,
              CategoryId: req.body.categoryId
            })
              .then((restaurant) => {
                req.flash('success_msg', '成功更新餐廳資料！')
                res.redirect('/admin/restaurants')
              })
          })
      })
    }
    else
      return Restaurant.findByPk(req.params.id)
        .then((restaurant) => {
          restaurant.update({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: restaurant.image,
            CategoryId: req.body.categoryId
          })
            .then((restaurant) => {
              req.flash('success_msg', '成功更新餐廳資料！')
              res.redirect('/admin/restaurants')
            })
        })
  },
  deleteRestaurant: (req, res) => {
    Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        return restaurant.destroy()
      })
      .then(restaurant => {
        return res.redirect('/admin/restaurants')
      })
  },
}

module.exports = adminController