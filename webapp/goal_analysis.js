async function goalAnalysisForPlayer(player) {
	let data = await readFile('data.csv')
	let critical_data = await readFile('critical_data.csv')

	data = data.split('\n').slice(1).map(x => x.split(','))
	critical_data = critical_data.split('\n').slice(1).map(x => x.split(','))

	addTableForPlayer(player, data, 'Goals');
	addHistogramForPlayer(player, data, 'Goals scored per time');
	addStackedForPlayer(player, data, critical_data, 'Goals over time');
	addPieForPlayer(player, data, 'Goals scored per time');
}

async function goalAnalysisForTeam(team) {
	let data = await readFile('data.csv')
	let critical_data = await readFile('critical_data.csv')

	data = data.split('\n').slice(1).map(x => x.split(','))
	critical_data = critical_data.split('\n').slice(1).map(x => x.split(','))

	addTableForTeam(team, data, 'Goals');
	addHistogramForTeam(team, data, 'Goals scored per time');
	addStackedForTeam(team, data, critical_data, 'Goals over time');
	addPieForTeam(team, data, 'Goals scored per time');
}
