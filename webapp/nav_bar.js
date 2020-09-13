function FillNavBar(analysis, team) {

	function addHeading(document, heading) {
		document.innerHTML = heading
	}

	function addNavBar(doc, data) {
		data.forEach(datapoint => {
			var a = document.createElement('a');
			a.href = datapoint.href;
			var linkText = document.createTextNode(datapoint.title + "  |  ");
			a.appendChild(linkText);
			doc.appendChild(a)
		})
	}

	async function readFile(file_name) {
		let data = await fetch(file_name).then(x => x.text())
		return data
	}

	async function getTeams() {
		let data = await readFile('../data.csv')
		data = data.split('\n').slice(1).map(x => x.split(','))
		let teams = new Set()

		data.forEach(datapoint => {
			teams.add(datapoint[1])
		})
		addHeading(document.getElementById('team nav heading'), 'Please select team for per team analysis');

		let nav_data = []
		teams.forEach(team => {
			nav_data.push({
				title: team,
				href: 'team.html?team=' + team + '&analysis=' + analysis
			})
		})
		addNavBar(document.getElementById('team bar'), nav_data.sort())
	}

	async function getPlayers(team) {
		let data = await readFile('../data.csv')
		data = data.split('\n').slice(1).map(x => x.split(','))
		let players = new Set()

		data.forEach(datapoint => {
			if(datapoint[6] == team && datapoint[5] != 'Own Goal') {
				players.add(datapoint[4])
			}
		})
		addHeading(document.getElementById('player nav heading'), 'Please select player for per player analysis');

		let nav_data = []
		players.forEach(player => {
			nav_data.push({
				title: player,
				href: 'player.html?player=' + player + '&analysis=' + analysis + '&team=' + team
			})
		})
		addNavBar(document.getElementById('player bar'), nav_data.sort())
	}

	console.log(analysis, team)
	getTeams()

	if (team) {
		getPlayers(team)
	}
}
