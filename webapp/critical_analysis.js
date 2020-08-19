async function readFile(file_name) {
	let data = await fetch(file_name).then(x => x.text())
	return data
}

function plotCrtitcalDataLinePlot() {
	function getChartVarsFromData(data) {

		let dateWiseData = new Map();
		let allTeams = new Set();

		data.forEach(matchpoint => allTeams.add(matchpoint[1]));
		data.forEach(matchpoint => {
			if (!dateWiseData.has(matchpoint[0])) {
				dateWiseData.set(matchpoint[0], new Map());
			}
			let date_map = dateWiseData.get(matchpoint[0]);
			if (!date_map.has(matchpoint[6])) {
				date_map.set(matchpoint[6], 0);
			}
			date_map.set(matchpoint[6], date_map.get(matchpoint[6]) + 1);
		});

		let plot_data = new Map();
		let result = { data: [], columnNames: ["Date"]};
		let team_whitelist = new Set(['Manchester City', "Liverpool", "Manchester Utd", "Chelsea", "Arsenal", "Tottenham"])
		dateWiseData.forEach((date_map, date) => {
			date_map.forEach((value, team) => {
				if (!plot_data.has(team)) {
					plot_data.set(team, 0);
				}
				plot_data.set(team, plot_data.get(team) + value);
			});
			let dateData = [new Date(date)];
			team_whitelist.forEach(team => {
				if (!plot_data.has(team)) {
					plot_data.set(team, 0);
				}
				dateData.push(plot_data.get(team));
			});
			result.data.push(dateData);
		});
		team_whitelist.forEach(team => result.columnNames.push(team));
		return result
	}

	async function plotGoalsLinePlot(csv_data, div_id, title) {
		csv_data = csv_data.split('\n').slice(1).join('\n')
		csv_data = csv_data.split('\n').map(x => x.split(','))
		let plot_data = getChartVarsFromData(csv_data)

		var data = new google.visualization.DataTable();
		data.addColumn('date', 'Date');
		for (let i = 1; i < plot_data.columnNames.length; i++) {
			data.addColumn('number', plot_data.columnNames[i]);
		}
		data.addRows(plot_data.data);
		var options = {
			hAxis: {
				title: 'Date'
			},
			vAxis: {
				title: title				
			},
			chartArea: {width: '70%', height: '70%'}
		};
		var chart = new google.visualization.LineChart(document.getElementById(div_id));
		chart.draw(data, options);

	}

	async function plotCharts() {
		let data = await readFile('data.csv')
		let critical_data = await readFile('critical_data.csv')
		plotGoalsLinePlot(data, 'goal-scored', 'Goal Scored per day')
		plotGoalsLinePlot(critical_data, 'critical-scored', 'Critical Goal Scored per day')
	}

	google.charts.load('current', {packages: ['corechart', 'line']});
	google.charts.setOnLoadCallback(plotCharts);
}


function addTableForTeam(team, data, title) {

	function getChartVarsFromData() {
		result = {
			data: [],
			columnNames: []
		}

		let perPlayerGoals = new Map();
		data.forEach(datapoint => {
			if(datapoint[5] != 'Own Goal' && datapoint[6] == team) {
				let player = datapoint[4];
				if(!perPlayerGoals.has(player)) {
					perPlayerGoals.set(player, 0)
				}
				perPlayerGoals.set(player, perPlayerGoals.get(player) + 1)
			}	
		})
		for ([key, value] of perPlayerGoals) {
			result.data.push([key, value])
		}
		return result;
	}

	function plotCharts() {
		let plot_data = getChartVarsFromData()

		var data = new google.visualization.DataTable();
		data.addColumn('string', 'Player');
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

function addHistogramForTeam(team, data, title) {
	function getChartVarsFromData() {
		result = {
			data: [],
			columnNames: []
		}

		data.forEach(datapoint => {
			if(datapoint[6] == team) {
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

function addStackedForTeam(team, data, critical_data, title) {
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
			if(datapoint[6] == team) {
				dateWiseGoals.set(datapoint[0], dateWiseGoals.get(datapoint[0]) + 1)
			}
		})

		critical_data.forEach(datapoint => {
			if(datapoint[6] == team) {
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

function addPieForTeam(team, data, title) {
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
			if(datapoint[6] == team) {
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

async function crticalAnalysisForTeam(team) {
	let data = await readFile('data.csv')
	let critical_data = await readFile('critical_data.csv')

	data = data.split('\n').slice(1).map(x => x.split(','))
	critical_data = critical_data.split('\n').slice(1).map(x => x.split(','))

	addTableForTeam(team, critical_data, 'Critical Goals');
	addHistogramForTeam(team, critical_data, 'Critical Goals scored per time');
	addStackedForTeam(team, data, critical_data, 'Goals over time');
	addPieForTeam(team, critical_data, 'Goals scored per time');
}

