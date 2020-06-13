// import chartAttack from '/scripts/chartAttack.mjs';
// import fetchData from './scripts/fetchData.mjs';
// `https://services1.arcgis.com/ISZ89Z51ft1G16OK/ArcGIS/rest/services/COVID19_WI/FeatureServer/10/query?outFields=*&where=GEO%20%3D%20'County'%20AND%20NAME%20%3D%20'Rusk'`
async function fetchData(value) {
  const url = `https://services1.arcgis.com/ISZ89Z51ft1G16OK/ArcGIS/rest/services/COVID19_WI/FeatureServer/10/query?where=GEO%3D'County'AND NAME%3D'${value}'&returnGeometry=true&outFields=OBJECTID,GEO,NAME,LoadDttm,NEGATIVE,POSITIVE,DEATHS,POS_NEW,NEG_NEW,TEST_NEW&outSR=4326&f=json`;
  // const url = '../data/sampleQuery2.json'; //local

  const response = await fetch(url); // (2)

  if (response.status == 200) {
    const json = await response.json(); // (3)
    
    const { features, errors } = validateFeatures(json); // (4)

    if (errors.length === 0) {
      const max = parseData.getMaxY(features);
      const days = parseData.getDays(features);

      return { features, errors, max, days };

    } else {
      return { errors }
    }
  } else {
    return new Error(response.status)
  }
};

// returns features and errors if any
function validateFeatures(json) {
  let errors = [];
  let features = [];

  if (json.features && Array.isArray(json.features)) {
    // console.log(json);
    features = json.features;
    //TODO - needs field validation

    return { features, errors };
  } else {
    errors.push('Features not found or is not an array.')
    return { errors };
  }
}

const parseData = {
  getMaxY: data => {
    let max = 60;

    data.forEach(day => {
      // console.log(day.attributes.POS_NEW);
      if (day.attributes.POS_NEW > max) {
        max = day.attributes.POS_NEW;
      }
    });
    return max;
  },
  getDays: data => {
    return data.length;
  }
}


function chartAttack(days, max, features) {
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
  const tableHeight = height + 26;
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

    bars += `<rect 
      x="${0 + 10 + i * (barWidth + barSpacing)}" 
      y="${height - att.POS_NEW * yPixelsPer}" 
      width="${barWidth}px" 
      height="${att.POS_NEW * yPixelsPer}px" 
      data-positive="${att.POS_NEW}"/>`

    //adjust spacing for double digit dates
    if (i % 2 == 0) {
      let half = (barWidth + barSpacing) / 2;
      let date = new Date(att.LoadDttm);
      // console.log(`${date.getMonth()+ 1}/${date.getDate()}`);
      let display = `${date.getMonth() + 1}/${date.getDate()}`;
      if (display.toString().length == 2) half += 3;
      if (display.toString().length == 3) half += 6;
      if (display.toString().length == 4) half += 9;

      xLabels += `<text x="${0 + 10 + i * (barWidth + barSpacing) + half}" y="${height + 15}">${display}</text>`
    }
  }

  // const wrapper = document.querySelector('#svg-wrapper');
  return `
    <div>
      <svg  width="${startX + 3}" height="${tableHeight}">
        <title id="title">Brown County Covid Cases</title>
        <g class="labels y-labels" transform="translate(0)">
          ${yLabels}
        </g>
        <g id="yAxis">
          <line x1="${startX}" y1="0" x2="${startX}" y2="${height}"></line>
        </g>
        <text x="${startX / 2}" y="${tableHeight / 2 - 6}" transform="rotate(-90,${startX / 2},${tableHeight / 2})" class="label-title">New Cases</text>

        <line class="xAxis" x1="${startX}" y1="${height}" x2="${width}" y2="${height}"></ line>

      </svg>
    </div>

    <div style="overflow-x: scroll; overscroll-behavior-x: none;">
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
}


window.onload = () => {
  const todaysDate = document.querySelector('#todaysDate');
  const wrapper = document.querySelector('#svg-wrapper');

  document.querySelector('#county-drop')
    .addEventListener('change', e => {
      const value = e.target.value;

      fetchData(value).then(data => {
        const { features, errors, max, days } = data;

        if (errors.length === 0) {
          const d = new Date();

          //update DOM
          wrapper.innerHTML = chartAttack(days, max, features);

          todaysDate.innerHTML = `${d.getMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`;

        } else {
          //TODO - add errors to DOM
          errors.forEach(error => {
            console.error(error);
          });
        }

      });
    });

  // fetchData('Brown').then(data => {
  //   const { features, errors, max, days } = data;

  //   if (errors.length === 0) {
  //     const d = new Date();

  //     wrapper.innerHTML = chartAttack(days, max, features);

  //     todaysDate.innerHTML = `${d.getMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`;
  //   } else {
  //     //TODO - add errors to DOM
  //     errors.forEach(error => {
  //       console.error(error);
  //     });
  //   }

  // });
  //TODO - get state numbers.
  //TODO - cache the query
  //TODO - console.log(window.matchMedia('(prefers-color-scheme: dark)').matches);
  //TODO - summarize county data
  //TODO - 7 day average

}
