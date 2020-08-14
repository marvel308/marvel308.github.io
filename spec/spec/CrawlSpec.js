const fetchMock = require('fetch-mock');
const fs = require('fs');
const writeData = require('../../src/crawl.js');

/* eslint max-len: ["error", { "ignoreStrings": true }]*/
const fixturesHTML = `
<div class="overthrow table_container" id="div_sched_ks_3232_1">
  <table class="min_width sortable stats_table now_sortable" id="sched_ks_3232_1" data-cols-to-freeze="1">
    <colgroup>
      <col>
      <col>
      <col>
      <col>
      <col>
      <col>
      <col>
      <col>
      <col>
      <col>
      <col>
      <col>
      <col>
      <col>
    </colgroup>
    <tbody>
      <tr data-row="0">
        <th scope="row" class="right " data-stat="gameweek">1</th>
        <td class="left " data-stat="dayofweek" csk="6">Fri</td>
        <td class="left " data-stat="date" csk="20190809"><a href="/en/matches/2019-08-09">2019-08-09</a></td>
        <td class="right " data-stat="time" csk="20:00:00"><span class="venuetime" data-venue-time-only="1" data-venue-epoch="1565377200" data-venue-time="20:00">20:00</span> <span class="localtime" data-label="your time"></span></td>
        <td class="right " style="font-weight: bold;" data-stat="squad_a"><a href="/en/squads/822bd0ba/Liverpool-Stats">Liverpool</a></td>
        <td class="right " data-stat="xg_a">1.8</td>
        <td class="center " data-stat="score"><a href="/en/matches/928467bd/Liverpool-Norwich-City-August-9-2019-Premier-League">4–1</a></td>
        <td class="right " data-stat="xg_b">1.0</td>
        <td class="left " data-stat="squad_b"><a href="/en/squads/1c781004/Norwich-City-Stats">Norwich City</a></td>
        <td class="right " data-stat="attendance" csk="53333">53,333</td>
        <td class="left " data-stat="venue">Anfield</td>
        <td class="left " data-stat="referee" csk="Michael Oliver2019-08-09">Michael Oliver</td>
        <td class="left " data-stat="match_report"><a href="/en/matches/928467bd/Liverpool-Norwich-City-August-9-2019-Premier-League">Match Report</a></td>
        <td class="left iz" data-stat="notes"></td>
      </tr>
      <tr data-row="1" class="">
        <th scope="row" class="right sort_show" data-stat="gameweek">1</th>
        <td class="left " data-stat="dayofweek" csk="7">Sat</td>
        <td class="left " data-stat="date" csk="20190810"><a href="/en/matches/2019-08-10">2019-08-10</a></td>
        <td class="right " data-stat="time" csk="12:30:00"><span class="venuetime" data-venue-time-only="1" data-venue-epoch="1565436600" data-venue-time="12:30">12:30</span> <span class="localtime" data-label="your time"></span></td>
        <td class="right " data-stat="squad_a"><a href="/en/squads/7c21e445/West-Ham-United-Stats">West Ham</a></td>
        <td class="right " data-stat="xg_a">0.8</td>
        <td class="center " data-stat="score"><a href="/en/matches/71c8a43e/West-Ham-United-Manchester-City-August-10-2019-Premier-League">0–5</a></td>
        <td class="right " data-stat="xg_b">3.0</td>
        <td class="left " style="font-weight: bold;" data-stat="squad_b"><a href="/en/squads/b8fd03ef/Manchester-City-Stats">Manchester City</a></td>
        <td class="right " data-stat="attendance" csk="59870">59,870</td>
        <td class="left " data-stat="venue">London Stadium</td>
        <td class="left " data-stat="referee" csk="Mike Dean2019-08-10">Mike Dean</td>
        <td class="left " data-stat="match_report"><a href="/en/matches/71c8a43e/West-Ham-United-Manchester-City-August-10-2019-Premier-League">Match Report</a></td>
        <td class="left iz" data-stat="notes"></td>
      </tr>
    </tbody>
  </table>
</div>
`;

const matchElement = `
<div id="">
  <div class="event a">
    <div>
      &nbsp;7’
      <br><small><span style="color:#777">1:0</span></small>
    </div>
    <div>
      <div class="event_icon own_goal"></div>
      <div>
        <div>
          <a href="/en/players/e9254eec/Grant-Hanley">Grant Hanley</a>
        </div>
        <small>Own Goal</small>
      </div>
    </div>
  </div>
  <div class="event b">
    <div>
      &nbsp;31’
      <br><small><span style="color:#777">1:0</span></small>
    </div>
    <div>
      <div class="event_icon goal"></div>
      <div>
        <div>
          <a href="/en/players/43a166b4/Divock-Origi">Divock Origi</a>
        </div>
        <small>Assist:
          <a href="/en/players/cd1acf9d/Trent-Alexander-Arnold">Trent Alexander-Arnold</a>
        </small>
      </div>
      <div style="display: none;">&nbsp;—&nbsp;Goal 4:0 </div>
    </div>
  </div>
</div>

`;
const goalData = `Date,Home,Away,Minute Scored,Goal Scorer,Fact,Team
2019-08-09,Liverpool,Norwich City,7’,Grant Hanley,Own Goal,Liverpool
2019-08-09,Liverpool,Norwich City,31’,Divock Origi,Assist:Trent Alexander-Arnold,Norwich City
2019-08-10,West Ham,Manchester City,7’,Grant Hanley,Own Goal,West Ham
2019-08-10,West Ham,Manchester City,31’,Divock Origi,Assist:Trent Alexander-Arnold,Manchester City`;

const criticalGoalData = `Date,Home,Away,Minute Scored,Goal Scorer,Fact,Team
2019-08-09,Liverpool,Norwich City,7’,Grant Hanley,Own Goal,Liverpool
2019-08-09,Liverpool,Norwich City,31’,Divock Origi,Assist:Trent Alexander-Arnold,Norwich City
2019-08-10,West Ham,Manchester City,7’,Grant Hanley,Own Goal,West Ham
2019-08-10,West Ham,Manchester City,31’,Divock Origi,Assist:Trent Alexander-Arnold,Manchester City`;

describe('crawl', () => {
  it('shows the completions', async () => {
    spyOn(fs, 'writeFile').and.callFake((file, data, func) => {
      data = data.split('\n').map((x) => x.trim());
      if (file == 'data.csv') {
        const expectedData = goalData.split('\n').map((x) => x.trim());
        expect(data).toEqual(jasmine.arrayContaining(expectedData));
      }
      if (file == 'critical_data.csv') {
        const expectedData = criticalGoalData.split('\n').map((x) => x.trim());
        expect(data).toEqual(jasmine.arrayContaining(expectedData));
      }
    });
    fetchMock.mock('https://fbref.com/en/comps/9/schedule/Premier-League-Scores-and-Fixtures', fixturesHTML);
    fetchMock.mock('https://fbref.com/en/matches/71c8a43e/West-Ham-United-Manchester-City-August-10-2019-Premier-League', matchElement);
    fetchMock.mock('https://fbref.com/en/matches/928467bd/Liverpool-Norwich-City-August-9-2019-Premier-League', matchElement);
    await writeData();
    fetchMock.restore();
  });
});
