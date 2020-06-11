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

function makeChart(days, max, features) {
  console.log(`days: ${days}, max: ${max}`);
  const startX = 60;


  //x stuff
  const barWidth = 9;
  const barSpacing = 9;
  let bars = '';
  let xLabels = '';

  //y stuff
  const yPixelsPer = 2;
  const yLabelSpacing = 10;
  const height = ((max % yLabelSpacing) + max + yLabelSpacing) * yPixelsPer;
  const tableHeight = height + 40;
  let yLines = '';
  let yLabels = '';

  //table id="county"
  const width = (days * (barWidth + barSpacing));

  //vertical numbers
  for (let i = 0; i < height; i += yLabelSpacing * yPixelsPer) {
    yLabels += `<text x="${startX - 5}" y="${height - i + 4}">${i / yPixelsPer}</text>`
  }

  //vertical lines - gray
  for (let i = height; i > 0; i -= yLabelSpacing * yPixelsPer) {
    yLines += `<line stroke="gray" x1="${0}" y1="${i}" x2="${width + barSpacing}" y2="${i}"></line>`
  }


  //horizontal bars
  for (let i = 0; i < features.length; i++) {
    const att = features[i].attributes;
    // console.log(att);

    bars += `<rect x="${0 + 10 + i * (barWidth + barSpacing)}" y="${height - att.POS_NEW * yPixelsPer}" width="${barWidth}px" height="${att.POS_NEW * yPixelsPer}px" data-positive="${att.POS_NEW}"/>`


    //adjust spacing for double digit dates
    if (i % 3 == 0) {
      let half = (barWidth + barSpacing) / 2;
      let date = new Date(att.LoadDttm);
      let display = `${date.getMonth()}/${date.getDate()}`;
      if (display.toString().length == 2) half += 3;
      if (display.toString().length == 3) half += 6;
      if (display.toString().length == 4) half += 9;

      xLabels += `<text x="${0 + 10 + i * (barWidth + barSpacing) + half}" y="${height + 15}">${display}</text>`
    }
  }

  const wrapper = document.querySelector('#svg-wrapper');
  wrapper.innerHTML = `
    <div>
      <svg  width="${startX + 3}" height="${tableHeight}">
        <title id="title">Brown County Covid Cases</title>
        <g class="labels y-labels" transform="translate(0)">
          ${yLabels}
        </g>
        <g id="yAxis">
          <line x1="${startX}" y1="0" x2="${startX}" y2="${height}"></line>
        </g>
        <text x="${startX / 2}" y="${tableHeight / 2 -6}" transform="rotate(-90,${startX / 2},${tableHeight / 2})" class="label-title">New Cases</text>

        <line class="xAxis" x1="${startX}" y1="${height}" x2="${width}" y2="${height}"></ line>
      </svg>
    </div>

    <div style="overflow-x: scroll;">
      <svg x="${0}" height="${tableHeight}" width="${width + startX}" class="labels x-labels">
        <g>
          ${yLines}
        </g>
        <g>
          ${bars}
        </g>
        <g class="bars-labels">
          ${xLabels}
        </g>

        <g id="xAxis">
          <line class="xAxis" x1="${0}" y1="${height}" x2="${width + barSpacing}" y2="${height}"></ line>
        </g>
        <line class="xAxis" x1="${0}" y1="${0}" x2="${width + barSpacing}" y2="${0}"></ line>

      </svg>
    </div>
  `
};

function makeCountiesDropdown(){

};

window.onload = () => {
  const url = '../data/sampleQuery2.json';

  getJson(url)
    .then(({ features }) => {
      // updateDomComponent('thisId');
      // console.log(features);
      const max = parseData.getMaxY(features);
      const days = parseData.getDays(features);
      let counties;

      makeChart(days, max, features)

    });

  // let dttm = new Date(1591274590000);
  // console.log(dttm.getUTCDate());


  // stateInCounty.innerHTML = `
  //   <line x1="0" y1="0" x2="300" y2="300" stroke="black"></line>
  //   `
  // console.log(stateInCounty);

}
