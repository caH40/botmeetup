const { Schema, model } = require('mongoose')

const ratingSchema = new Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	posts: {
		type: Number,
		required: true
	}
})
module.exports = model('ratings', ratingSchema)