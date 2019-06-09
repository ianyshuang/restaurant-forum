const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')

const multer = require('multer')
const upload = multer({ dest: 'temp/' }) // 當 multer 偵測到檔案上傳時，會自動將檔案寫入到 temp 這個 folder

module.exports = (app, passport) => {
  // 驗證是否登入
  const authenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    } else {
      res.redirect('/signin')
    }
  }
  // 驗證是否具有管理者權限
  const authenticatedAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
      if (req.user.isAdmin) {
        return next()
      } else {
        return res.redirect('/')
      }
    } else {
      res.redirect('/signin')
    }
  }

  // 使用者路由
  app.get('/', authenticated, (req, res) => res.redirect('/restaurants'))
  app.get('/restaurants', authenticated, restController.getRestaurants)

  // 管理者路由
  app.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/restaurants'))
  app.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)
  // 在驗證完之後進行上傳單一張圖片的動作
  app.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
  app.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
  app.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)
  app.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)
  app.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
  app.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)

  // 註冊路由
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)

  // 登入＆登出路由
  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  app.get('/logout', userController.logout)
}
