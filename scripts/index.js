/* global storageAvailable, getWithExpiry, setWithExpiry, fetchData, parseData, chartAttack, dynamicChart */

//[x]TODO - get state numbers.
//[x]TODO - adjust scale to screen height
//TODO - console.log(window.matchMedia('(prefers-color-scheme: dark)').matches);
//TODO - summarize county data
//TODO - 7 day average - display options
//TODO - change orientation to breakpoints. Check for iOS for font-size
//TODO - settings modal
//[x]TODO - fix eslint

const todaysDate = document.querySelector('#todaysDate');
const svgWrapper = document.querySelector('#svg-wrapper');
const contextWrapper = document.querySelector('#context-wrapper');
const dropdown = document.querySelector('#county-drop');
const settings = document.querySelector('#settings');
const stats = document.querySelector('#context-stats');

window.onload = async () => {
  /**@type {'state'|'county'} */
  const geo = dropdown.selectedOptions[0].dataset.geo;
  /**@type {string} - county (or state) */
  const selected = dropdown.options[dropdown.selectedIndex].value;

  // onload, get selected (WI) data
  let d1 = await getTheData({ value: selected, geo });
  render(d1);

  // onchange, get county data
  dropdown.addEventListener('change', async (e) => {
    // /**@type {'state'|'county'} */
    const geoChange = e.target.selectedOptions[0].dataset.geo;
    /**@type {string} */
    const value = e.target.value;

    let d2 = await getTheData({ value, geo: geoChange });
    render(d2);
  });

  settings.addEventListener('click', () => {
    console.log('handleSettings');
  });

  let mqString = `(resolution: ${window.devicePixelRatio}dppx)`;
  const updatePixelRatio = () => {
    let pr = window.devicePixelRatio;
    let prString = (pr * 100).toFixed(0);
    console.warn(prString);
    // pixelRatioBox.innerText = `${prString}% (${pr.toFixed(2)})`;
  };

  // updatePixelRatio();
  matchMedia(mqString).addListener(updatePixelRatio);

};

window.addEventListener('resize', async () => {
  // console.log('the orientation of the device is now ' + screen.orientation.angle);

  /**@type {'state'|'county'} */
  const geoRotate = dropdown.selectedOptions[0].dataset.geo;
  /**@type {string} - county (or state) */
  const selectedRotate = dropdown.options[dropdown.selectedIndex].value;

  // console.log(`immediate window.innerHeight: ${window.innerHeight}`);
  // getTheData({ value: selectedRotate, geo: geoRotate });

  let firstData = await getTheData({ value: selectedRotate, geo: geoRotate });
  // console.log('firstData', firstData);
  render(firstData);

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
 * @param {string} value - county name
 * @param {'county'|'state'} geo 
 * @returns {void} - manipulates DOM
 */
async function getTheData({ value, geo }) {
  // let cachedFeatures, fetchedFeatures, errors;

  if (storageAvailable('localStorage')) {
    const cachedFeatures = await getWithExpiry(value);

    if (cachedFeatures) {
      // drawDOM(cachedFeatures);
      return { cachedFeatures }
    }
    /* else, fetch new item and set cached item */
    else {
      const { features, errors } = await fetchData(value, geo);

      if (errors.length === 0) {

        let key = await setWithExpiry(value, features);
        //? message to DOM that this was fetched?

        const fetchedFeatures = await getWithExpiry(key);
        return { fetchedFeatures };
        // drawDOM(fetchedFeatures);

      } else {
        console.log(`errors`);
        return { errors }
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

function render(params) {
  const features = params.cachedFeatures || params.fetchedFeatures; //TODO - add others

  const d = new Date();
  const max = parseData.getMaxY(features);
  const days = parseData.getDays(features);
  const windowHeight = window.innerHeight;
  // console.log('render - windowHeight: ', windowHeight);

  svgWrapper.innerHTML = dynamicChart({ days, max, features, windowHeight, contextWrapper });

  todaysDate.innerHTML = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${d.toLocaleTimeString()}`;

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
