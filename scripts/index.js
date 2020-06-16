/* global storageAvailable, getWithExpiry, setWithExpiry, fetchData, parseData, chartAttack, dynamicChart */

//[x]TODO - get state numbers.
//TODO - adjust scale to screen height
//TODO - console.log(window.matchMedia('(prefers-color-scheme: dark)').matches);
//TODO - summarize county data
//TODO - 7 day average - display options
//[x]TODO - fix eslint

const todaysDate = document.querySelector('#todaysDate');
const svgWrapper = document.querySelector('#svg-wrapper');
const contextWrapper = document.querySelector('#context-wrapper');
const dropdown = document.querySelector('#county-drop');
const settings = document.querySelector('#settings');

window.onload = () => {
  /**@type {'state'|'county'} */
  const geoStart = dropdown.selectedOptions[0].dataset.geo;
  /**@type {string} - county (or state) */
  const selected = dropdown.options[dropdown.selectedIndex].value;

  // onload, get selected (WI) data
  getTheData(selected, geoStart);

  // onchange, get county data
  dropdown.addEventListener('change', e => {
    /**@type {'state'|'county'} */
    const geoChange = e.target.selectedOptions[0].dataset.geo;
    /**@type {string} */
    const value = e.target.value;

    getTheData(value, geoChange);
  });

  settings.addEventListener('click', () => handleSettings(contextWrapper));

  //TODO - check for memory leak with addEventListeners
  window.addEventListener('orientationchange', () => {
    console.log('the orientation of the device is now ' + screen.orientation.angle);
    /**@type {'state'|'county'} */
    const geoRotate = dropdown.selectedOptions[0].dataset.geo;
    /**@type {string} - county (or state) */
    const selectedRotate = dropdown.options[dropdown.selectedIndex].value;

    window.setTimeout(function () {
      getTheData(selectedRotate, geoRotate);
    }, 50);


  });

};


/**
 * 
 * @param {string} value - county name
 * @param {'county'|'state'} geo 
 * @returns {void} - manipulates DOM
 */
async function getTheData(value, geo) {

  if (storageAvailable('localStorage')) {
    const cachedFeatures = await getWithExpiry(value);

    if (cachedFeatures) {
      drawDOM(cachedFeatures);
    }
    /* else, fetch new item and set cached item */
    else {
      const { features, errors } = await fetchData(value, geo);

      if (errors.length === 0) {

        let key = await setWithExpiry(value, features);
        //? message to DOM that this was fetched?

        const fetchedFeatures = await getWithExpiry(key);
        drawDOM(fetchedFeatures);

      } else {
        console.log(`errors`);
        //     //TODO - add errors to DOM
        //     errors.forEach(error => {
        //       console.error(error);
        //     });
      }

    }
  }
  /* no localStorage */
  else {
    //     //TODO - add errors to DOM
    console.error('Too bad, no localStorage for you');
  }
}

function drawDOM(features) {
  const d = new Date();
  const max = parseData.getMaxY(features);
  const days = parseData.getDays(features);

  // update DOM
  // svgWrapper.innerHTML = chartAttack({days, max, features});

  svgWrapper.innerHTML = dynamicChart({ days, max, features });

  todaysDate.innerHTML = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${d.toLocaleTimeString()}`;
}

function handleSettings(w) {
  console.dir(w);
  console.log('handleSettings');
}


let mqString = `(resolution: ${window.devicePixelRatio}dppx)`;
const updatePixelRatio = () => {
  let pr = window.devicePixelRatio;
  let prString = (pr * 100).toFixed(0);
  console.warn(prString);
  // pixelRatioBox.innerText = `${prString}% (${pr.toFixed(2)})`;
}

// updatePixelRatio();

matchMedia(mqString).addListener(updatePixelRatio);