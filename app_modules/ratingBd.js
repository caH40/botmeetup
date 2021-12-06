const Rating = require('../models/Rating')

async function creatRating(userName) {
	const listRating = await Rating.findOne({ "username": userName })
	if (listRating) {
		await Rating.updateOne({ "username": userName }, { $inc: { posts: 1 } })
			.catch((err) => console.log(err))
	} else {
		const ratingAdd = new Rating({ "username": userName, "posts": 1 })
		ratingAdd.save()
			.catch((err) => console.log(err))
	}
}

module.exports = creatRating
