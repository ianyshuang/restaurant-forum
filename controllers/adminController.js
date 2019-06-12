const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const fs = require('fs')

const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminController = {
  getUsers: (req, res) => {
    User.findAll()
      .then(users => res.render('admin/users', { users }))
  },
  putUsers: (req, res) => {
    User.findByPk(req.params.id)
      .then(user => {
        if (user.isAdmin) {
          user.update({
            isAdmin: 0
          })
        } else {
          user.update({
            isAdmin: 1
          })
        }
        req.flash('success_msg', '成功修改使用者權限！')
        return res.redirect('/admin/users')
      })
  },
  getRestaurants: (req, res) => {
    Restaurant.findAll()
      .then(restaurants => res.render('admin/restaurants', { restaurants }))
  },
  createRestaurant: (req, res) => {
    return res.render('admin/create')
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
        image: null
      }).then((restaurant) => {
        req.flash('success_msg', '成功新增餐廳！')
        return res.redirect('/admin/restaurants')
      })
    }
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
            image: restaurant.image
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
  }
}

module.exports = adminController