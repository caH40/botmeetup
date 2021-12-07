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

async function createListRating() {
	let ratingTextI = `Самые активные организаторы заездов:\n`
	const contextParse = await Rating.find().sort({ posts: -1 })
	for (let i = 0; i < contextParse.length; i++) {
		let ratingText = `${i + 1}. ${contextParse[i].username}-${contextParse[i].posts} 🚴 \n`
		ratingTextI = ratingTextI + ratingText
	}
	return ratingTextI
}


module.exports.creatRating = creatRating
module.exports.createListRating = createListRating
