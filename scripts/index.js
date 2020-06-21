/* global */

// import { html, render } from 'https://unpkg.com/lit-html?module'; //PROD
// import { html, render } from '../node_modules/lit-html/lit-html.js'; //DEV
import { storageAvailable, getWithExpiry, setWithExpiry, fetchData } from './general.js';
import { parseData, validateFeatures, getUrl } from './covidBrown.js';
import { dynamicChart } from './chartAttack.js';

//[x]TODO - get state numbers.
//[x]TODO - adjust scale to screen height
//TODO - console.log(window.matchMedia('(prefers-color-scheme: dark)').matches);
//TODO - summarize county data
//TODO - 7 day average - display options
//TODO - change orientation to breakpoints. Check for iOS for font-size
//[x]TODO - settings modal
//[x]TODO = set scroll to max right on chart
//[x]TODO - fix eslint

const todaysDate = document.querySelector('#todaysDate');
const expiryDate = document.querySelector('#expiryDate');
const svgWrapper = document.querySelector('#svg-wrapper');
const contextWrapper = document.querySelector('#context-wrapper');
const dropdown = document.querySelector('#county-drop');
const settings = document.querySelector('#settings');

//Modal settings:
const showChartAverage = document.querySelector('#showChartAverage');
// const stats = document.querySelector('#context-stats');

window.onload = async () => {

  /**@type {'state'|'county'} */
  const geo = dropdown.selectedOptions[0].dataset.geo;
  /**@type {string} - county (or state) */
  const selected = dropdown.options[dropdown.selectedIndex].value;

  // onload, get selected (WI) data
  let d1 = await getChartData({ value: selected, geo });
  // console.log(d1);
  baseRender(d1);

  // let mqString = `(resolution: ${window.devicePixelRatio}dppx)`;
  // const updatePixelRatio = () => {
  //   let pr = window.devicePixelRatio;
  //   let prString = (pr * 100).toFixed(0);
  //   console.warn(prString);
  //   // pixelRatioBox.innerText = `${prString}% (${pr.toFixed(2)})`;
  // };

  // // updatePixelRatio();
  // matchMedia(mqString).addListener(updatePixelRatio);
};

// onchange, get county data
dropdown.addEventListener('change', async (e) => {

  /**@type {'state'|'county'} */
  const geoChange = e.target.selectedOptions[0].dataset.geo;
  /**@type {string} */
  const value = e.target.value;

  let d2 = await getChartData({ value, geo: geoChange });
  baseRender(d2);
});

//mobile orientation change or resize browser
window.addEventListener('resize', async () => {
  // console.log('the orientation of the device is now ' + screen.orientation.angle);
  // console.log(`immediate window.innerHeight: ${window.innerHeight}`);

  /**@type {'state'|'county'} */
  const geoRotate = dropdown.selectedOptions[0].dataset.geo;
  /**@type {string} - county (or state) */
  const selectedRotate = dropdown.options[dropdown.selectedIndex].value;

  const firstData = await getChartData({ value: selectedRotate, geo: geoRotate });
  // .then(d => {
  // console.log(`Then window.innerHeight: ${window.innerHeight}`);
  // return d;
  // });

  baseRender(firstData);

  // window.setTimeout(function () {
  //   /**@type {'state'|'county'} */
  //   // const geoRotateInner = dropdown.selectedOptions[0].dataset.geo;
  //   /**@type {string} - county (or state) */
  //   // const selectedRotateInner = dropdown.options[dropdown.selectedIndex].value;

  //   // let iN = await scoped(first);
  //   // console.log(iN);
  //   console.log(` after timeout, window.innerHeight: ${window.innerHeight}`);
  //   // getTheData({ value: selectedRotateInner, geo: geoRotateInner });
  // }, 1000);
});

// screen.addEventListener('change', () => { 
//   console.log("... " + screen.orientation.angle);
// });

/**
 * 
 * @param {string} value - county name or state
 * @param {'county'|'state'} geo 
 * @returns {{cachedFeatures:object, fetchedFeatures:object, errors:object}} - manipulates DOM
 */
async function getChartData({ value, geo }) {

  if (storageAvailable('localStorage')) {
    // const cachedFeatures = await getWithExpiry(value);
    let { data, expiry } = await getWithExpiry(value);

    if (data) {
      return { cachedFeatures: data, expiry };
    }
    /* else, fetch new item and set cached item */
    else {
      const { json, errors } = await fetchData(getUrl(value, geo));

      /* check for fetching error */
      if (errors.length === 0) {

        const { features, validationErrors } = validateFeatures(json);

        /* check for parsing errors */
        if (validationErrors.length === 0) {
          let key = await setWithExpiry(value, features);
          //? message to DOM that this was fetched?

          // eslint-disable-next-line no-shadow
          let { data, expiry } = await getWithExpiry(key);
          return { fetchedFeatures: data, expiry };
        } else {
          return { errors: validationErrors };
        }


      } else {
        console.log(`errors`);
        return { errors };
      }

    }
  }
  /* no localStorage */
  else {
    return { errors: ['Too bad, no localStorage for you'] };
  }
}


function baseRender(params) {
  const features = params.cachedFeatures || params.fetchedFeatures;
  // console.log(features);
  const { expiry, errors } = params;

  if (!errors) {
    const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    const d = new Date();
    const e = new Date(expiry);

    // const { average, sum } = parseData.averagePOS_NEW(features);
    const sma = parseData.smaPOS_NEW(features, 7);
    console.log(sma);

    svgWrapper.innerHTML = dynamicChart({
      data: features,
      numOfDays: parseData.numOfDays(features),
      highestCasesPerDay: parseData.highestCasesPerDay(features),
      windowHeight: window.innerHeight - contextWrapper.clientHeight,
      orientation,
    });

    todaysDate.innerHTML = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${d.toLocaleTimeString()}`;

    expiryDate.innerHTML = `${e.getMonth() + 1}/${e.getDate()}/${e.getFullYear()} ${e.toLocaleTimeString()}`;

    // TODO - scrollingSvg created in chartAttack - needs to be disconnected 
    const scrollingSvg = document.querySelector('#scrolling-svg');
    scrollingSvg.scrollLeft = 1414;

  } else {

    svgWrapper.innerHTML = errors.map(error => {
      return `<div>${error}</div>`;
    });
  }

}

// let modalBtn = document.getElementById('modal-btn');
const modal = document.querySelector('.modal');
const closeBtn = document.querySelector('#modal-close');

settings.addEventListener('click', () => {
  modal.style.display = 'flex';
});
closeBtn.onclick = function () {
  modal.style.display = 'none';
};
window.onclick = function (e) {
  if (e.target === document.querySelector('.modal-background')) {
    modal.style.display = 'none';
  }
};

showChartAverage.addEventListener('change', () => {

  if (showChartAverage.checked) {
    const chartAverageDays = document.querySelector('#chartAverageDays');
    console.dir(chartAverageDays.value);
  }
});

function handleSettings(cW) {

}