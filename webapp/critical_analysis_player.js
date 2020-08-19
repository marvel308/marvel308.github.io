function addTableForPlayer(player, data, title) {

	function getChartVarsFromData() {
		result = {
			data: [],
			columnNames: []
		}

		let perTeamGoals = new Map();
		data.forEach(datapoint => {
			if(datapoint[5] != 'Own Goal' && datapoint[4] == player) {
				let team = datapoint[1];
				if(team == datapoint[6]) {
					team = datapoint[2]
				}
				if(!perTeamGoals.has(team)) {
					perTeamGoals.set(team, 0)
				}
				perTeamGoals.set(team, perTeamGoals.get(team) + 1)
			}	
		})
		for ([key, value] of perTeamGoals) {
			result.data.push([key, value])
		}
		return result;
	}

	function plotCharts() {
		let plot_data = getChartVarsFromData()

		var data = new google.visualization.DataTable();
		data.addColumn('string', 'Team Against');
		data.addColumn('number', title);
		data.addRows(plot_data.data);
		var options = {
			width: '100%',
			showRowNumber: true,
			page: 'enable',
			pageSize: 10,
			sortColumn: 1,
			sortAscending: false,
			height: '100%'
		};
		var chart = new google.visualization.Table(document.getElementById('table'));
		chart.draw(data, options);

	}

	google.charts.load('current', {'packages':['table']});
	google.charts.setOnLoadCallback(plotCharts);
}

function addHistogramForPlayer(player, data, title) {
	function getChartVarsFromData() {
		result = {
			data: [],
			columnNames: []
		}

		data.forEach(datapoint => {
			if(datapoint[5] != 'Own Goal' && datapoint[4] == player) {
				let time = parseInt(datapoint[3])
				let player = datapoint[4]; 
				result.data.push([player, time])
			}	
		})
		return result;
	}

	function plotCharts() {
		let plot_data = getChartVarsFromData()
		var data = new google.visualization.DataTable();
		data.addColumn('string', 'Player');
		data.addColumn('number', 'Time');
		data.addRows(plot_data.data);
		var options = {
			title: title,
			chartArea: {width: '100%', height: '80%'}
		};
		var chart = new google.visualization.Histogram(document.getElementById('histogram'));
		chart.draw(data, options);

	}

	google.charts.load('current', {packages: ['corechart']});
	google.charts.setOnLoadCallback(plotCharts);
}

function addStackedForPlayer(player, data, critical_data, title) {
	function getChartVarsFromData() {
		let dateWiseGoals = new Map();
		let dateWiseCriticalGoals = new Map();

		let allDates = new Set()

		let result = {
			data: [],
			columnNames: []
		}

		data.forEach(datapoint => {
			dateWiseGoals.set(datapoint[0], 0);
			dateWiseCriticalGoals.set(datapoint[0], 0);
			allDates.add(datapoint[0])
		});

		data.forEach(datapoint => {
			if(datapoint[5] != 'Own Goal' && datapoint[4] == player) {
				dateWiseGoals.set(datapoint[0], dateWiseGoals.get(datapoint[0]) + 1)
			}
		})

		critical_data.forEach(datapoint => {
			if(datapoint[5] != 'Own Goal' && datapoint[4] == player) {
				dateWiseCriticalGoals.set(datapoint[0], dateWiseCriticalGoals.get(datapoint[0]) + 1)
			}
		})

		let currentGoals = 0;
		let currentCriticalGoals = 0;
		allDates.forEach(date => {
			currentGoals += dateWiseGoals.get(date);
			currentCriticalGoals += dateWiseCriticalGoals.get(date);
			result.data.push([new Date(date), currentGoals, currentCriticalGoals])
		})
		console.log(result)
		return result

	}

	function plotCharts() {
		let plot_data = getChartVarsFromData()
		var data = new google.visualization.DataTable();
		data.addColumn('date', 'Date');
		data.addColumn('number', 'Goal');
		data.addColumn('number', ' Critical Goal');
		data.addRows(plot_data.data);
		var options = {
			title: title,
			// chartArea: {width: '100%', height: '80%'}
		};
		var chart = new google.visualization.SteppedAreaChart(document.getElementById('stacked'));
		chart.draw(data, options);
	}

	google.charts.load('current', {packages: ['corechart']});
	google.charts.setOnLoadCallback(plotCharts);
}

function addPieForPlayer(player, data, title) {
	function getChartVarsFromData() {
		result = {
			data: [],
			columnNames: []
		}
		let petTimeData = new Map();
		petTimeData.set('0-22', 0);
		petTimeData.set('23-45', 0);
		petTimeData.set('46-68', 0);
		petTimeData.set('69-90', 0);
		data.forEach(datapoint => {
			if(datapoint[5] != 'Own Goal' && datapoint[4] == player) {
				let time = parseInt(datapoint[3])
				let player = datapoint[4];
				if (time <= 22) {
					petTimeData.set('0-22', petTimeData.get('0-22') + 1);
				}
				else if (time <= 45) {
					petTimeData.set('23-45', petTimeData.get('23-45') + 1);
				}
				else if (time <= 68) {
					petTimeData.set('46-68', petTimeData.get('46-68') + 1);
				}
				else {
					petTimeData.set('69-90', petTimeData.get('69-90') + 1);
				}
			}	
		});

		for ([key, value] of petTimeData) {
			result.data.push([key, value]);
		}
		return result;
	}

	function plotCharts() {
		let plot_data = getChartVarsFromData()
		var data = new google.visualization.DataTable();
		data.addColumn('string', 'Time scored');
		data.addColumn('number', 'Time');
		data.addRows(plot_data.data);
		var options = {
			title: title,
			chartArea: {width: '100%', height: '80%'}
		};
		var chart = new google.visualization.PieChart(document.getElementById('pie'));
		chart.draw(data, options);

	}


	google.charts.load('current', {packages: ['corechart']});
	google.charts.setOnLoadCallback(plotCharts);
}

async function crticalAnalysisForPlayer(player) {
	let data = await readFile('data.csv')
	let critical_data = await readFile('critical_data.csv')

	data = data.split('\n').slice(1).map(x => x.split(','))
	critical_data = critical_data.split('\n').slice(1).map(x => x.split(','))

	addTableForPlayer(player, critical_data, 'Critical Goals');
	addHistogramForPlayer(player, critical_data, 'Critical Goals scored per time');
	addStackedForPlayer(player, data, critical_data, 'Goals over time');
	addPieForPlayer(player, critical_data, 'Goals scored per time');
}

