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
//TODO - settings modal
//[x]TODO - fix eslint

const todaysDate = document.querySelector('#todaysDate');
const expiryDate = document.querySelector('#expiryDate');
const svgWrapper = document.querySelector('#svg-wrapper');
const contextWrapper = document.querySelector('#context-wrapper');
const dropdown = document.querySelector('#county-drop');
const settings = document.querySelector('#settings');
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

settings.addEventListener('click', () => {
  console.log('handleSettings');
});

window.addEventListener('resize', async () => {
  // console.log('the orientation of the device is now ' + screen.orientation.angle);

  /**@type {'state'|'county'} */
  const geoRotate = dropdown.selectedOptions[0].dataset.geo;
  /**@type {string} - county (or state) */
  const selectedRotate = dropdown.options[dropdown.selectedIndex].value;

  // console.log(`immediate window.innerHeight: ${window.innerHeight}`);
  // getTheData({ value: selectedRotate, geo: geoRotate });

  let firstData = await getChartData({ value: selectedRotate, geo: geoRotate })
    .then(d => {
      console.log(`Then window.innerHeight: ${window.innerHeight}`);
      return d;
    });
  // console.log('firstData', firstData);
  //? instead of re-rendering, let's pass in new width and height...
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
        //TODO - add errors to DOM
      }

    }
  }
  /* no localStorage */
  else {
    //TODO - add errors to DOM
    return { errors: ['Too bad, no localStorage for you'] };
  }
}


function baseRender(params) {
  const features = params.cachedFeatures || params.fetchedFeatures;
  // console.log(features);
  const { expiry, errors } = params;

  const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  const d = new Date();
  const e = new Date(expiry);
  //TODO = check state

  svgWrapper.innerHTML = dynamicChart({
    data: features,
    numOfDays: parseData.numOfDays(features),
    highestCasesPerDay: parseData.highestCasesPerDay(features),
    windowHeight: window.innerHeight - contextWrapper.clientHeight,
    orientation,
  });

  todaysDate.innerHTML = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${d.toLocaleTimeString()}`;

  expiryDate.innerHTML = `${e.getMonth() + 1}/${e.getDate()}/${e.getFullYear()} ${e.toLocaleTimeString()}`;

  // stats.innerHTML = parseTheStats(features);
}

function parseTheStats(params) {
  //county highest new (& state)
  //county total 

  return `
  <div>Stats</div>
  `;

}

function handleSettings(cW) {

}
//Browser 	CSS Prefix	JavaScript Prefix
// Safari & Chrome	-webkit-	webkit
// Internet Explorer	-ms-	ms
// Firefox	-moz-	moz
// Opera	-o-	
