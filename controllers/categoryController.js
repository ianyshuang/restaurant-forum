const db = require('../models')
const Category = db.Category

const categoryController = {
  // category controller actions
  getCategories: (req, res) => {
    Category.findAll()
      .then(categories => {
        if (req.params.id) {
          Category.findByPk(req.params.id)
            .then(category => res.render('admin/categories.pug', { categories, category }))
        } else {
          return res.render('admin/categories.pug', { categories })
        }
      })
  },
  postCategory: (req, res) => {
    if (!req.body.categoryName) {
      req.flash('error_msg', '請輸入種類名稱！')
      return res.redirect('/admin/categories')
    } else {
      return Category.create({
        name: req.body.categoryName
      })
        .then(category => res.redirect('/admin/categories'))
    } 
  },
  putCategory: (req, res) => {
    Category.findByPk(req.params.id)
      .then(category => {
        category.name = req.body.categoryName
        category.save()
        return res.redirect('/admin/categories')
      })
  },
  deleteCategory: (req, res) => {
    Category.findByPk(req.params.id)
      .then(category => {
        category.destroy()
        return res.redirect('/admin/categories')
      })
  }
}

module.exports = categoryController