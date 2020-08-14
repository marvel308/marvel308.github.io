const fs = require('fs');

/**
 * Sorts data by minutes scored.
 * @param {Object[]} a - The first point.
 * @param {Object[]} b - The second point.
 * @return {number}
 */
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

/**
 * Sorts data by date.
 * @param {Object[]} a - The first point.
 * @param {Object[]} b - The second point.
 * @return {number}
 */
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

/**
 * Gets critical goals data from raw data.
 * @param {Object[]} data - The raw data.
 * @return {string} Critical goals data.
 */
function getCriticalData(data) {
  const m = new Map();

  const criticalGoals = [];

  data.forEach((a) => {
    const key = a[1] + '-' + a[2];
    let delta = 0;
    if (a[1] == a[6]) {
      delta++;
    } else if (a[2] == a[6]) {
      delta--;
    }
    if (m.has(key)) {
      const score = m.get(key);
      m.set(key, score + delta);
    } else {
      m.set(key, delta);
    }
    if (a[1] == a[6]) {
      if (m.get(key) >=0 && m.get(key) <=2) {
        criticalGoals.push(a);
      }
    } else if (a[2] == a[6]) {
      if (m.get(key) <=0 && m.get(key) >=-2) {
        criticalGoals.push(a);
      }
    }
  });
  criticalGoals.sort(compare2);
  return criticalGoals.map((x) => x.join(',')).join('\n');
}

/**
 * Writes data into critical_data.csv.
 * @param {string} data - The raw data.
 */
async function writeCriticalData(data) {
  data = data.split('\n');
  data = data.map((a) => a.split(','));
  data.sort(compare);
  const criticalGoals = getCriticalData(data);
  const criticalData = ['Date,Home,Away,Minute Scored,Goal Scorer,Fact,Team',
    criticalGoals].join('\n');
  await fs.writeFile('critical_data.csv', criticalData);
}

module.exports = writeCriticalData;
