//https://services1.arcgis.com/ISZ89Z51ft1G16OK/ArcGIS/rest/services/COVID19_WI/FeatureServer/10/query?where=GEO %3D 'County' AND NAME %3D 'Brown'&returnGeometry=true&outFields=OBJECTID,GEO,NAME,LoadDttm,NEGATIVE,POSITIVE,DEATHS&outSR=4326&f=json
function monthNames(number) {
  // console.log(number == 2);
  // let month = '';
  switch (number) {

    case 0: return 'January';
    case 1: return 'February';
    case 2: return 'March';
    case 3: return 'April';
    case 4: return 'May';
    case 5: return 'June';
    case 6: return 'July';
    default: 'none';
  }
  // return month;
}

async function getJson(url) {
  let response = await fetch(url); // (2)

  if (response.status == 200) {
    let json = await response.json(); // (3)
    return json;
  } else {
    return new Error(response.status)
  }
};


const parseData = {
  getMaxY: data => {
    let max = 0;

    if (Array.isArray(data)) {
      data.forEach(day => {
        // console.log(day.attributes.POS_NEW);
        if (day.attributes.POS_NEW > max) {
          max = day.attributes.POS_NEW;
        }
      });
      return max;

    } else {
      throw new Error('Not array');
    }
  },
  getDays: data => {
    if (Array.isArray(data)) {
      return data.length;

    } else {
      throw new Error('Not array');
    }
  }
}

function makeCountyChart(days, max, features) {
  console.log(`days: ${days}, max: ${max}`);
  const startX = 80;


  //x stuff
  const barWidth = 9;
  const barSpacing = 9;
  let bars = '';
  let xLabels = '';

  //y stuff
  const yPixelsPer = 2;
  const yLabelSpacing = 10;
  const height = ((max % yLabelSpacing) + max + yLabelSpacing) * yPixelsPer;
  console.log(`height: ${height}`);
  const tableHeight = height + 80;
  let yLines = '';
  let yLabels = '';

  //table 
  const width = (days * (barWidth + barSpacing) + startX);
  console.log(`width: `, width);

  //vertical line
  for (let i = height; i > 0; i -= yLabelSpacing * yPixelsPer) {
    yLines += `<line stroke="gray" x1="${startX}" y1="${i}" x2="${width}" y2="${i}"></line>`
  }

  //vertical numbers
  for (let i = 0; i <= height; i += yLabelSpacing * yPixelsPer) {
    yLabels += `<text x="${startX - 5}" y="${height - i}">${i / yPixelsPer}</text>`
  }


  //horizontal bars
  for (let i = 0; i < features.length; i++) {
    const att = features[i].attributes;
    // console.log(att);

    bars += `<rect x="${startX + i * (barWidth + barSpacing)}" y="${height - att.POS_NEW * yPixelsPer}" width="${barWidth}px" height="${att.POS_NEW * yPixelsPer}px" data-positive="${att.POS_NEW}"/>`


    //adjust spacing for double digit dates
    if (i % 3 == 0) {
      let half = (barWidth + barSpacing) / 2;
      let date = new Date(att.LoadDttm);
      // let date = new Date(att.LoadDttm).getDate();
      // let month = new Date(att.LoadDttm).getMonth();
      let display = `${date.getMonth()}/${date.getDate()}`;
console.log(display.length);
      if (display.toString().length == 2) half += 3;
      if (display.toString().length == 3) half += 6;
      if (display.toString().length == 4) half += 9;
      // if (display.toString().length == 4) half += 13;

      xLabels += `<text x="${startX + i * (barWidth + barSpacing) + half}" y="${height + 15}">${display}</text>`
    }
  }


  //parse monthLines
  let monthHolder = {};
  let monthLine = '';
  for (let i = 0; i < features.length; i++) {
    const att = features[i].attributes;
    let month = monthNames(new Date(att.LoadDttm).getMonth());
    // console.log(month);

    if (!monthHolder[month]) {
      monthHolder[month] = 0;
    }
    if (monthHolder[month] === 0) {
      monthHolder[month] += 1;
    } else {
      monthHolder[month] += 1;
    }
  }

  //draw monthLines
  let dayCount = 0;
  let sink = 0;
  for (const [key, value] of Object.entries(monthHolder)) {
    let i = value;
    // console.log(monthHolder[month]);
    console.log(`${key}: ${value}`);
    // for (let i = 0; i < features.length; i++) {
    // const att = features[i].attributes;
    // console.log(att);

    var color = random_rgba();

    monthLine += `<line stroke="${color}" x1="${startX + dayCount * (barWidth + barSpacing)}" y1="${height + 20 + sink}" x2="${startX + dayCount + value * (barWidth + barSpacing)}" y2="${height + 20 + sink}"></line>`

    dayCount += value;
    sink += 2;
    // }
    console.log(`dayCount:`, dayCount);


  }
  function random_rgba() {
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
}

  console.log(monthHolder);

  const county = document.querySelector('#county');
  county.setAttribute('width', width + startX);
  county.setAttribute('height', tableHeight);
  county.innerHTML = `
    <title id="title">Brown County Covid Cases</title>

    <g class="labels y-labels">
      <g>
        ${yLines}
      </g>
      <g>
        ${yLabels}
      </g>
      <g id="yAxis">
        <line x1="${startX}" y1="0" x2="${startX}" y2="${height}"></line>
      </g>
      <text x="${startX / 2}" y="${height / 2}" transform="rotate(-90,${startX / 2},${height / 2})" class="label-title">New Cases</text>
    </g>

    <g class="labels x-labels">
      <g >
        ${bars}
      </g>
      <g class="bars-labels">
        ${xLabels}
      </g>
      <g class="">
        ${monthLine}
      </g>
      <g id="xAxis">
        <line x1="${startX}" y1="${height}" x2="${width}" y2="${height}"></ line>
      </g>

    </g>
  `
};

window.onload = () => {
  const url = '../data/sampleQuery2.json';

  getJson(url)
    .then(({ features }) => {
      // updateDomComponent('thisId');
      // console.log(features);
      const max = parseData.getMaxY(features);
      const days = parseData.getDays(features);
      // console.log(`max: ${max}`);
      // updateDom.county(xWidth, yHeight)
      // updateDom.yAxis(yHeight);
      // updateDom.xAxis(xWidth, yHeight);
      makeCountyChart(days, max, features)

    });

  // let dttm = new Date(1591274590000);
  // console.log(dttm.getUTCDate());


  // stateInCounty.innerHTML = `
  //   <line x1="0" y1="0" x2="300" y2="300" stroke="black"></line>
  //   `
  // console.log(stateInCounty);

}
