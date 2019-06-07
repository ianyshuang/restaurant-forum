const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const pug = require('pug')
const path = require('path')

// 設置 template engine
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))



app.listen(port, () => {
  console.log(`Express server is running on ${port}`)
})