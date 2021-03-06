// меню дата
const daySec = 86400000;// один день в миллисекундах
const dateSecToday = () => { return new Date().getTime() }; // сегодняшний день в миллисекундах
// создаем массив из 10 дней начиная с сегодняшнего дня

const creatDayArr = () => {
	var dayArr = []; //toLocaleDateString() приводит вид даты в стандартный вид дд.мм.гггг
	const days = {
		0: 'Вс.',
		1: 'Пн.',
		2: 'Вт.',
		3: 'Ср.',
		4: 'Чт.',
		5: 'Пт.',
		6: 'Сб.'
	};
	for (let i = 0; i < 12; i++) {
		let currentDay = new Date(dateSecToday() + daySec * i);
		dayArr.push(days[currentDay.getDay()] + ', ' + currentDay.toLocaleDateString());
	};
	return dayArr
};
// меню города необходимо четное количество городов
const locations = ['Пятигорск', 'Кисловодск', 'Барашек', 'Карачаевск', 'Архыз', 'Алагир', 'Ессентуки', 'Минеральные Воды'];
// меню время
const timesArr = [];
for (let h = 5; h < 20; h++) {
	for (let m = 0; m < 31; m = m + 30) {
		if (m === 0) {
			timesArr.push(`${h}:${m}0`)
		}
		else {
			timesArr.push(`${h}:${m}`)
		}
	}
};
// дистанция
const distanceArr = ['40км', '60км', '80км', '100км', '120км', '140км', '160км', '180км', '200км', '200+км', '300+км', '400+км'];
// Средняя скорость
const speedArr = ['20км/ч', '25км/ч', '28км/ч', '30км/ч', '35км/ч', '40км/ч'];
// Сложность
const levelArr = ['Восстановительная 🏖', 'Легкая', 'Средняя', 'Интервалы', 'Сложная', 'Горы 🚵'];



module.exports.locations = locations;
module.exports.creatDayArr = creatDayArr;
module.exports.timesArr = timesArr;
module.exports.distanceArr = distanceArr;
module.exports.speedArr = speedArr;
module.exports.levelArr = levelArr;
module.exports.dateSecToday = dateSecToday;
module.exports.daySec = daySec;