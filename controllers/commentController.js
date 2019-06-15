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
    return Comment.findByPk(req.params.id)
      .then(comment => {
        comment.destroy()
          .then(() => res.redirect(`/restaurants/${comment.RestaurantId}`))
      })
  }
}

module.exports = commentController