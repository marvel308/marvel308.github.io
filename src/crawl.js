require('isomorphic-fetch');
const fs = require('fs');
const jsdom = require('jsdom');

const writeCriticalData = require('./critical.js');

/**
 * Gets match events.
 * @param {Object} document - The DOM document object.
 * @param {string} event - HTML class name.
 * @return {Object[]} Gets all match events.
 */
function getEvents(document, event) {
  result = [];
  for (const div of document.getElementsByClassName(event)) {
    if (div.getElementsByClassName('event_icon own_goal').length > 0) {
      const time = div.children[0].textContent.trim().split('\n')[0];
      const goalScorer = div.children[1].children[1].children[0]
          .textContent.trim();
      const fact = div.children[1].children[1].children[1].textContent
          .split('\n').map((a) => a.trim()).reduce((a, b) => a + b);
      result.push([time, goalScorer, fact]);
    }

    if (div.getElementsByClassName('event_icon goal').length > 0) {
      const time = div.children[0].textContent.trim().split('\n')[0];
      const goalScorer = div.children[1].children[1].children[0]
          .textContent.trim();
      let fact = '';
      if (div.children[1].children[1].children.length > 1) {
        fact = div.children[1].children[1].children[1].textContent.split('\n').
            map((a) => a.trim()).reduce((a, b) => a + b);
      }
      result.push([time, goalScorer, fact]);
    }
    if (div.getElementsByClassName('event_icon penalty_goal').length > 0) {
      const time = div.children[0].textContent.trim().split('\n')[0];
      const goalScorer = div.children[1].children[1].children[0].
          textContent.trim();
      let fact = '';
      if (div.children[1].children[1].children.length > 1) {
        fact = div.children[1].children[1].children[1].textContent.split('\n').
            map((a) => a.trim()).reduce((a, b) => a + b);
      }
      result.push([time, goalScorer, fact]);
    }
  }
  return result;
}

/**
 * Gets facts about match.
 * @param {Object} document - The DOM document object.
 * @return {Object} Facts about home and away side.
 */
function getMatchFacts(document) {
  const home = getEvents(document, 'event a');
  const away = getEvents(document, 'event b');
  return {home: home, away: away};
}

/**
 * Fetches metadata for all matches.
 * @param {Object} document - The DOM document object.
 * @return {Object[]} All match metadata.
 */
function getAllGames(document) {
  const div = document.getElementById('sched_ks_10728_1');
  const hrefss = [];
  for (let i = 0; i< div.rows.length; i++) {
    if (div.rows[i].cells[12].firstElementChild) {
      const result = [
        div.rows[i].cells[2].textContent,
        div.rows[i].cells[4].textContent,
        div.rows[i].cells[8].textContent,
        div.rows[i].cells[12].firstElementChild.href,
      ];
      hrefss.push(result);
    }
  }
  return hrefss;
}

/**
 * Scrapes data from url.
 * @param {string} url - The url to crall from.
 * @return {Object} DOM document object.
 */
async function fetchFromUrl(url) {
  url = 'https://fbref.com' + url;
  const result = await fetch(url).then(function(response) {
    // The API call was successful!
    return response.text();
  }).then(function(html) {
    // Convert the HTML string into a document object
    const dom = new jsdom.JSDOM(html);

    return dom.window.document;
  }).catch(function(err) {
    // There was an error
    console.info('Something went wrong.', err);
  });
  return result;
}

/**
 * Gets game data.
 * @param {Object[]} arr - The game metadata.
 * @return {string} Game data.
 */
async function fetchGame(arr) {
  const doc = await fetchFromUrl(arr[3]);
  const gameData = getMatchFacts(doc);
  const result = [];
  for (const game of gameData.home) {
    result.push([arr[0], arr[1], arr[2], game[0], game[1], game[2], arr[1]]
        .join(','));
  }
  for (const game of gameData.away) {
    result.push([arr[0], arr[1], arr[2], game[0], game[1], game[2], arr[2]]
        .join(','));
  }
  return result.join('\n');
}

/**
 * Scrapes data from url.
 * @param {string} url - The url to crall from.
 * @return {string} Goals data.
 */
async function scrapeAllData(url) {
  const result = [];
  const doc = await fetchFromUrl(url);
  for (const game of getAllGames(doc)) {
    const data = await fetchGame(game);
    result.push(data);
  }
  return result.filter((x) => x).join('\n');
}

/** Writes raw and critical data. */
async function writeData() {
  data = await scrapeAllData(
      '/en/comps/9/schedule/Premier-League-Scores-and-Fixtures');
  data = ['Date,Home,Away,Minute Scored,Goal Scorer,Fact,Team',
    data].join('\n');
  await fs.writeFile('data.csv', data, (err) => console.error(err));
  return writeCriticalData(data);
}

module.exports = writeData;
