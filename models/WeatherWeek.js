const { Schema, model } = require('mongoose')

const weatherWeek = new Schema({
	list: {

		type: JSON

	}
})

module.exports = model('weatherWeeks', weatherWeek)