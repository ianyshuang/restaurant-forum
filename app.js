const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const pug = require('pug')
const path = require('path')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('./config/passport') // 要從 /config 讀取已經設定過的 passport 物件
const methodOverride = require('method-override')

const db = require('./models')

// 設置 template engine
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// 使用 bodyParser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
  secret: 'anything',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(methodOverride('_method'))

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.user = req.user
  next()
})

app.listen(port, () => {
  db.sequelize.sync()
  console.log(`Express server is running on ${port}`)
})

require('./routes')(app, passport)