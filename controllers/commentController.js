const db = require('../models')
const Comment = db.Comment

const commentController = {
  postComment: (req, res) => {
    Comment.create({
      text: req.body.text,
      UserId: req.user.id,
      RestaurantId: req.body.restaurantId
    })
      .then(comment => {
        return res.redirect(`/restaurants/${req.body.restaurantId}`)
      })
  },
  deleteComment: (req, res) => {
    Comment.findByPk(req.params.id)
      .then(comment => {
        return comment.destroy()
      })
      .then(comment => {
        return res.redirect(`/restaurants/${comment.RestaurantId}`)
      })
  }
}

module.exports = commentController