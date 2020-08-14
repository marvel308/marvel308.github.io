const fetchMock = require('fetch-mock');
const fs = require('fs');
const writeData = require('../../src/crawl.js');

const fixturesHTML = `
<div class="overthrow table_container" id="div_sched_ks_3232_1">
  <table id="sched_ks_3232_1">
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
        <th>1</th>
        <td class="left " data-stat="dayofweek" csk="6">Fri</td>
        <td>2019-08-09</td>
        <td>></td>
        <td><a href="/en/squads/822bd0ba/Liverpool-Stats">Liverpool</a></td>
        <td class="right " data-stat="xg_a">1.8</td>
        <td><a href="/test-url-1">4–1</a></td>
        <td class="right " data-stat="xg_b">1.0</td>
        <td><a href="/en/squads/1c781004/Norwich">Norwich City</a></td>
        <td class="right " data-stat="attendance" csk="53333">53,333</td>
        <td class="left " data-stat="venue">Anfield</td>
        <td>Michael Oliver</td>
        <td><a href="/test-url-1">Match Report</a></td>
        <td class="left iz" data-stat="notes"></td>
      </tr>
      <tr data-row="1" class="">
        <th>1</th>
        <td class="left " data-stat="dayofweek" csk="7">Sat</td>
        <td><a href="/en/matches/2019-08-10">2019-08-10</a></td>
        <td>12:30</td>
        <td>West Ham</td>
        <td class="right " data-stat="xg_a">0.8</td>
        <td>0–5</td>
        <td class="right " data-stat="xg_b">3.0</td>
        <td>Manchester City</td>
        <td class="right " data-stat="attendance" csk="59870">59,870</td>
        <td class="left " data-stat="venue">London Stadium</td>
        <td>Mike Dean</td>
        <td><a href="/test-url-2">Match Report</a></td>
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
          XX
        </small>
      </div>
      <div style="display: none;">&nbsp;—&nbsp;Goal 4:0 </div>
    </div>
  </div>
</div>

`;
const goalData = `Date,Home,Away,Minute Scored,Goal Scorer,Fact,Team
2019-08-09,Liverpool,Norwich City,7’,Grant Hanley,Own Goal,Liverpool
2019-08-09,Liverpool,Norwich City,31’,Divock Origi,Assist:XX,Norwich City
2019-08-10,West Ham,Manchester City,7’,Grant Hanley,Own Goal,West Ham
2019-08-10,West Ham,Manchester City,31’,Divock Origi,Assist:XX,Manchester City`;

const criticalGoalData = `Date,Home,Away,Minute Scored,Goal Scorer,Fact,Team
2019-08-09,Liverpool,Norwich City,7’,Grant Hanley,Own Goal,Liverpool
2019-08-09,Liverpool,Norwich City,31’,Divock Origi,Assist:XX,Norwich City
2019-08-10,West Ham,Manchester City,7’,Grant Hanley,Own Goal,West Ham
2019-08-10,West Ham,Manchester City,31’,Divock Origi,Assist:XX,Manchester City`;

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
    fetchMock.mock('https://fbref.com/test-url-1', matchElement);
    fetchMock.mock('https://fbref.com/test-url-2', matchElement);
    await writeData();
    fetchMock.restore();
  });
});
