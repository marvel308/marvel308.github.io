const fs = require('fs');


function compare(a, b) {
  if (a[3] < b[3]) {
    return -1;
  }
  if (a[3] > b[3]) {
    return 1;
  }
  // a must be equal to b
  return 0;
}


function compare2(a, b) {
  if (a[0] < b[0]) {
    return -1;
  }
  if (a[0] > b[0]) {
    return 1;
  }
  if (a[1] < b[1]) {
    return -1;
  }
  if (a[1] > b[1]) {
    return 1;
  }
  // a must be equal to b
  return 0;
}


function insertIntoMap(map, value) {
	// value = value.replace(/"/g, '')
	if(map.has(value)) {
		map.set(value, map.get(value) + 1)
	}
	else {
		map.set(value, 1)
	}
}

function GetDataFromMap(map, map2) {
	let result = []
	for (let [key, value] of map) {
		result.push([value, map2.get(key), key])
	}
	result.sort((a, b) => {
		if(parseInt(a[0]) < parseInt(b[0])) {
			return -1
		}
		if(parseInt(a[0]) > parseInt(b[0])) {
			return 1
		}
		return 0
	})
	return result.reverse().map(a => a.join(',')).join('\n')
}

function getCriticalData(data) {
	let m = new Map()

	let critical_goals = []

	data.forEach((a) => {
		let key = a[1] + "-" + a[2];
		let delta = 0;
		if (a[1] == a[6]) {
			delta++
		}
		else if (a[2] == a[6]) {
			delta--
		}
		if (m.has(key)) {
			let score = m.get(key)
			m.set(key, score + delta)
		}
		else {
			m.set(key, delta)
		}
		if (a[1] == a[6]) {
			if(m.get(key) >=0 && m.get(key) <=2) {
				critical_goals.push(a)
			}
		}
		else if (a[2] == a[6]) {
			if(m.get(key) <=0 && m.get(key) >=-2) {
				critical_goals.push(a)
			}
		}
	})
	critical_goals.sort(compare2)
	return critical_goals.map(x => x.join(',')).join('\n')
}

async function writeCriticalData(data) {
	data = data.split('\n')
	data = data.map(a => a.split(','))
	data.sort(compare)
	let critical_goals = getCriticalData(data)
	let critical_data = ['Date,Home,Away,Minute Scored,Goal Scorer,Fact,Team', critical_goals].join('\n')
	fs.writeFile('critical_data.csv', critical_data, (err) => console.error(err))
}

module.exports = writeCriticalData