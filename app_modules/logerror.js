const fs = require('fs')
module.exports = function creatLogs(error) {
	fs.appendFile('./app_modules/logerrors.txt', `${new Date().toLocaleString()}: ${error},\n`, err => {
		if (err) {
			throw err
		}
	})
}