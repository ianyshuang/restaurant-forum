const db = require('../models')
const Restaurant = db.Restaurant
const fs = require('fs')

const adminController = {
  getRestaurants: (req, res) => {
    Restaurant.findAll()
      .then(restaurants => res.render('admin/restaurants', { restaurants }))
  },
  createRestaurant: (req, res) => {
    return res.render('admin/create')
  },
  postRestaurant: (req, res) => {
    console.log(req.body)
    const { name, tel, address, opening_hours, description } = req.body
    if (!name) {
      req.flash('error_msg', '請填寫餐廳名稱！')
      return res.redirect('back')
    }
    const { file } = req // 從 req 中把檔案拿出
    if (file) {
      fs.readFile(file.path, (err, data) => {
        if (err) console.log('Error: ', err)
        fs.writeFile(`upload/${file.originalname}`, data, () => {
          return Restaurant.create({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: file ? `/upload/${file.originalname}` : null
          }).then((restaurant) => {
            req.flash('success_msg', '成功新增餐廳！')
            return res.redirect('/admin/restaurants')
          })
        })
      })
    } else {
      return Restaurant.create({
        name,
        tel,
        address,
        opening_hours,
        description
      })
        .then(restaurant => {
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
    const { name, tel, address, opening_hours, description } = req.body
    if (!name) {
      req.flash('error_msg', '請填寫餐廳名稱！')
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      fs.readFile(file.path, (err, data) => {
        if (err) console.log('Error: ', err)
        fs.writeFile(`upload/${file.originalname}`, data, () => {
          Restaurant.findByPk(req.params.id)
            .then((restaurant) => {
              return restaurant.update({
                name,
                tel,
                address,
                opening_hours,
                description,
                image: file ? `/upload/${file.originalname}` : restaurant.image
              })
                .then((restaurant) => {
                  req.flash('success_msg', '成功更新餐廳資料！')
                  return res.redirect('/admin/restaurants')
                })
            })
        })
      })
    } else {
      Restaurant.findByPk(req.params.id)
        .then((restaurant) => {
          return restaurant.update({
            name,
            tel,
            address,
            opening_hours,
            description,
            image: restaurant.image
          })
        })
        .then((restaurant) => {
          req.flash('success_msg', '成功更新餐廳資料！')
          return res.redirect('/admin/restaurants')
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