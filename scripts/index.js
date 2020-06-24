/* global */

// import { html, render } from 'https://unpkg.com/lit-html?module'; //PROD
// import { html, render } from '../node_modules/lit-html/lit-html.js'; //DEV
import { storageAvailable, getWithExpiry, setWithExpiry, fetchData } from './general.js';
import { parseData, validateFeatures, getUrl } from './covidBrown.js';
import { dynamicChart } from './chartAttack.js';
import { componentSma } from './settingOptions.js';


const todaysDate = document.querySelector('#todaysDate');
const expiryDate = document.querySelector('#expiryDate');
const svgWrapper = document.querySelector('#svg-wrapper');
const contextWrapper = document.querySelector('#context-wrapper');
const dropdown = document.querySelector('#county-drop');
const settings = document.querySelector('#settings-icon');
const version = document.querySelector('#version');

// const STATE = {
//   smaIsChecked: true,
//   smaDays: 7,
//   geo: '',
//   value: '',
// };

const STATE = (function () {
  let self = {
    version: 1.2,
    smaIsChecked: true,
    smaDays: 7,
    geo: '',
    value: ''
  };


  return {
    get: thing => {

      return self[thing] ? self[thing] : self;
    },
    setState: (obj) => {

      if (obj) {

        let tempObj = {};
        for (let i in self) {
          tempObj[i] = self[i];
        }

        // console.log(tempObj);
        // console.log(Object.isFrozen(tempObj));

        for (const prop in obj) {
          if (obj.hasOwnProperty(prop)) {
            // console.log(`obj.${prop} = ${obj[prop]}`);
            tempObj[prop] = obj[prop];
            // Object.freeze(self[prop]);
          }
        }

        self = tempObj;

        Object.freeze(self);

        events.publish('UPDATE', self);
        return self[obj];
      } else {
        // console.error('not found');
        return null;
      }
    }
  };

}());

/**
 * https://davidwalsh.name/pubsub-javascript 
 * Pub Sub
*/
const events = (function () {
  let topics = {};
  let hOP = topics.hasOwnProperty;

  return {
    subscribe: (topic, listener) => {
      // Create the topic's object if not yet created
      if (!hOP.call(topics, topic)) topics[topic] = [];

      // Add the listener to queue
      let index = topics[topic].push(listener) - 1;

      // Provide handle back for removal of topic
      return {
        remove: () => {
          delete topics[topic][index];
        }
      };
    },
    publish: (topic, info) => {
      // If the topic doesn't exist, or there's no listeners in queue, just leave
      if (!hOP.call(topics, topic)) return;

      // Cycle through topics queue, fire!
      topics[topic].forEach(function (item) {
        item(info != undefined ? info : {});
      });
    }
  };
})();


// eslint-disable-next-line no-unused-vars
const SUBS = events.subscribe('UPDATE', async (state) => {
  const data = await getChartData(state);
  baseRender({ data, state });
});



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


/**
 * 
 * @param {object} params
 * @param {[]} [params.cachedFeatures]
 * @param {[]} [params.fetchedFeatures]
 * @param {string[]} params.errors
 * @return {void} - updates DOM
 */
function baseRender({ data, state }) {
  const features = data.cachedFeatures || data.fetchedFeatures;
  
  const { expiry, errors } = data;

  if (!errors) {
    const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    const d = new Date();
    const e = new Date(expiry);

    svgWrapper.innerHTML = dynamicChart({
      data: features,
      numOfDays: parseData.numOfDays(features),
      highestCasesPerDay: parseData.highestCasesPerDay(features),
      windowHeight: window.innerHeight - contextWrapper.clientHeight,
      orientation,
      sma: state.smaIsChecked ? parseData.smaPOS_NEW(features, state.smaDays) : null,
    });

    todaysDate.innerHTML = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${d.toLocaleTimeString()}`;

    expiryDate.innerHTML = `${e.getMonth() + 1}/${e.getDate()}/${e.getFullYear()} ${e.toLocaleTimeString()}`;

    // TODO - scrollingSvg created in chartAttack - needs to be disconnected 
    // const scrollingDiv = document.querySelector('#scrolling-div');
    // scrollingDiv.scrollLeft = scrollingDiv.scrollLeftMax;
    document.querySelector('#scrolling-div').scrollLeft += 5000;
    /** SETTINGS OPTIONS */
    // const { average, sum } = parseData.averagePOS_NEW(features);

  } else {

    svgWrapper.innerHTML = errors.map(error => {
      return `<div>${error}</div>`;
    });
  }

}


async function handleDropdown() {

  /**@type {HTMLOptionElement} */
  const selected = dropdown.options[dropdown.selectedIndex];
  /**@type {'state'|'county'} */
  const geo = selected.dataset.geo;
  /**@type {string} - county (or state) */
  const value = selected.value;

  STATE.setState({ geo, value });
}


window.onload = () => init();


function init() {
  handleDropdown();
  //mobile orientation change or resize browser
  window.addEventListener('resize', handleDropdown);
  dropdown.addEventListener('change', handleDropdown);

  version.innerHTML = `v${STATE.get('version')}`;

  /** MODAL */
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
  window.addEventListener('touchstart', e => {
    if (e.target === document.querySelector('.modal-background')) {
      modal.style.display = 'none';
    }
  });
  loadSettingOptions();
}

/**
 * Dynamically insert settings components into DOM
 * Called from init
 */
function loadSettingOptions() {
  const settingOptions = document.querySelector('#setting-options');
  //All of the settings components go here
  settingOptions.innerHTML = componentSma(STATE);

  //SMA - from component
  const smaCheckbox = document.querySelector('#sma-checkbox');
  smaCheckbox.addEventListener('change', e => {
    const checked = e.target.checked;

    STATE.setState({ smaIsChecked: checked });

    // console.log(`checked: ${checked}, STATE`, STATE.get());

  });

  const smaDays = document.querySelector('#sma-days');
  smaDays.addEventListener('change', e => {
    const value = e.target.value;

    STATE.setState({ smaDays: parseInt(value) });

    // console.log(`value: ${value}, STATE`, STATE.get());
  });

}

//Modal settings:

// const stats = document.querySelector('#context-stats');
//stats: county population
// top five counties in states (pie cahrt)


// const showChartAverage = document.querySelector('#showChartAverage');
// showChartAverage.addEventListener('change', handleSma);

/** Settings Handlers */
// function handleSma(features) {
//   const sma = showChartAverage.checked ? parseData.smaPOS_NEW(features, 7) : null;

//   if (sma) {
//     handleSma();
//   }

//   if (showChartAverage.checked) {
//     const chartAverageDays = document.querySelector('#chartAverageDays'); //number of days to average
//     const svgChart = document.querySelector('#svg-chart');
//     let g = document.createElement('g');
//     g.setAttribute('id', 'text');
//     g.innerHTML = `<text x="20" y="20"> Hello</text>`;
//     svgChart.append(g);

//     console.dir(chartAverageDays.value);
//   } else {
//     const t = document.querySelector('#text');
//     t.remove(t);

//   }
// }
