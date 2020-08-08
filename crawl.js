const fetch = require("node-fetch");
const fs = require('fs');
const jsdom = require("jsdom");

function getEvents(document, event) {
  result = []
  for (let div of document.getElementsByClassName(event)) {
      if(div.getElementsByClassName('event_icon own_goal').length > 0) {
          let time = div.children[0].textContent.trim().split('\n')[0]
          let goal_scorer = div.children[1].children[1].children[0].textContent.trim()
          let fact = div.children[1].children[1].children[1].textContent.split('\n').map(a => a.trim()).reduce((a, b) => a + b)
          result.push([time, goal_scorer, fact])
      }

      if(div.getElementsByClassName('event_icon goal').length > 0) {
          let time = div.children[0].textContent.trim().split('\n')[0]
          let goal_scorer = div.children[1].children[1].children[0].textContent.trim()
          let fact = ''
          if (div.children[1].children[1].children.length > 1)
          fact = div.children[1].children[1].children[1].textContent.split('\n').map(a => a.trim()).reduce((a, b) => a + b)
          result.push([time, goal_scorer, fact])
      }
      if(div.getElementsByClassName('event_icon penalty_goal').length > 0) {
          let time = div.children[0].textContent.trim().split('\n')[0]
          let goal_scorer = div.children[1].children[1].children[0].textContent.trim()
          let fact = ''
          if (div.children[1].children[1].children.length > 1)
          fact = div.children[1].children[1].children[1].textContent.split('\n').map(a => a.trim()).reduce((a, b) => a + b)
          result.push([time, goal_scorer, fact])
      }
  }
  return result
}

function getMatchFacts(document) {
  let home = getEvents(document, 'event a')
  let away = getEvents(document, 'event b')
  return {home: home, away: away}
}

function GetAllGames(document) {
  let div = document.getElementById('sched_ks_3232_1')
  let hrefss = []
  for(let i = 0; i< div.rows.length; i++) {
      if(div.rows[i].cells[12].firstElementChild) {
        let result = [
          div.rows[i].cells[2].textContent,
          div.rows[i].cells[4].textContent,
          div.rows[i].cells[8].textContent,
          div.rows[i].cells[12].firstElementChild.href
        ]
          hrefss.push(result)
      }
  }
  return hrefss
}

async function fetchFromUrl(url) {
  url = 'https://fbref.com' + url;
  let result = await fetch(url).then(function (response) {
    // The API call was successful!
    return response.text();
  }).then(function (html) {
    // Convert the HTML string into a document object
    const dom = new jsdom.JSDOM(html);
 
    return dom.window.document;
  }).catch(function (err) {
    // There was an error
    console.info('Something went wrong.', err);
  });
  return result;
}

async function fetchGame(arr) {
  let doc = await fetchFromUrl(arr[3])
  let game_data = getMatchFacts(doc)
  let result = []
  for(let game of game_data.home) {
    result.push([arr[0], arr[1], arr[2], game[0], game[1], game[2], arr[1]])
  }
  for(let game of game_data.away) {
    result.push([arr[0], arr[1], arr[2], game[0], game[1], game[2], arr[2]])
  }
  return result
}

async function scrapeAllData(url) {
	let result = []
	let doc = await fetchFromUrl(url)
	for (let game of GetAllGames(doc)) {
 		let data =  await fetchGame(game)
 		result.push(data.join(','))
 	}
 	return result.join('\n')
}

async function writeData() {
	data = await scrapeAllData('/en/comps/9/schedule/Premier-League-Scores-and-Fixtures');
	data = ['Date,Home,Away,Minute Scored,Goal Scorer,Fact,Team', data].join('\n')
	fs.writeFile('data.csv', data, (err) => console.error(err))
}

writeData()
