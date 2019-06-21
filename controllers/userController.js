const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship

const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
  signUpPage: (req, res) => res.render('signup'),
  signUp: (req, res) => {
    if (req.body.password !== req.body.passwordCheck) {
      req.flash('error_msg', '兩次輸入密碼不同！')
      return res.redirect('/signup')
    } else {
      User.findOne({ where: { email: req.body.email } })
        .then(user => {
          if (user) {
            req.flash('error_msg', '此信箱已被註冊過了！')
            return res.redirect('/signup')
          } else {
            User.create({
              name: req.body.name,
              email: req.body.email,
              password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
            })
              .then(user => {
                req.flash('success_msg', '成功註冊帳號！')
                return res.redirect('/signin')
              })
          }
        })

    }
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_msg', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_msg', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res) => {
    return User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: [Restaurant]}
      ]
    })
      .then(user => {
        const comments = user.Comments.map(item => ({
          ...item.dataValues
        }))
        const restaurantsId = Array.from(new Set(comments.map(item => item.RestaurantId)))
        const restaurants = restaurantsId.map(id => ({
          id: id,
          name: comments.find(comment => comment.RestaurantId === id).Restaurant.name,
          image: comments.find(comment => comment.RestaurantId === id).Restaurant.image,
        }))
        res.render('user.pug', { user, restaurants })
      })
  },
  editUser: (req, res) => {
    if (req.user.id != req.params.id) {
      req.flash('error_msg', '您沒有權限修改其他使用者的資料！')
      res.redirect(`/users/${req.params.id}`)
    }
    return User.findByPk(req.params.id)
      .then(user => res.render('edit.pug', { user }))
  },
  putUser: (req, res) => {
    if (!req.body.name) {
      req.flash('error_msg', '請輸入姓名！')
      res.redirect(`/users/${req.params.id}`)
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then(user => {
            user.name = req.body.name
            user.image = img.data.link
            user.save()
            res.redirect(`/users/${req.params.id}`)
          })
      })
    } else {
      return User.findByPk(req.params.id)
        .then(user => {
          user.name = req.body.name
          user.save()
          res.redirect(`/users/${req.params.id}`)
        })
    }
  },
  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(favorite => res.redirect('back'))
  },
  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then(favorite => {
      return favorite.destroy()
    }).then(() => res.redirect('back'))
  },
  addLike: (req, res) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(like => res.redirect('back'))
  },
  removeLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then(like => {
      return like.destroy()
    }).then(() => res.redirect('back'))
  },
  getTopUser: (req, res) => {
    return User.findAll({
      include: [
        { model: User, as: 'Followers'}
      ]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        followerCounts: user.Followers.length,
        // 目前都入使用者是否有追蹤這個使用者
        isFollowed: req.user.Followings.map(item => item.id).includes(user.id)
      }))
      users = users.sort((a, b) => b.followerCounts - a.followerCounts)
      return res.render('topUser.pug', { users })
    })
  },
  addFollowing: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    }).then(followship => res.redirect('back'))
  },
  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    }).then(followship => {
      return followship.destroy()
    }).then(() => res.redirect('back'))
  }
}

module.exports = userController