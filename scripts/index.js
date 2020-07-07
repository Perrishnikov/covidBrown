/* global */

// import { html, render } from 'https://unpkg.com/lit-html?module'; //PROD
// import { html, render } from '../node_modules/lit-html/lit-html.js'; //DEV
import { storageAvailable, getWithExpiry, setWithExpiry, fetchData, isMobile } from './general.js';
import { parseData, validateFeatures, getUrl } from './covidBrown.js';
import { dynamicChart } from './chartAttack.js';
import { componentSma, openModalWith, viewSma, viewAllTheData } from './section-modal.js';
import { events } from './pub-sub.js';
import { statsSection } from './section-stats.js';


const todaysDate = document.querySelector('#todaysDate');
const expiryDate = document.querySelector('#expiryDate');
const svgWrapper = document.querySelector('#svg-wrapper');
const contextWrapper = document.querySelector('#context-wrapper');
const dropdown = document.querySelector('#county-drop');
const masterModal = document.querySelector('#masterModal'); //set html
const contextStats = document.querySelector('#context-stats');


const STATE = (function () {
  let self = {

    version: '1.4',
    smaIsChecked: true,
    smaDays: 7,
    geo: '',
    value: ''
  };


  return {
    get: thing => {

      if (thing) {
        return self[thing] ? self[thing] : null;
      } else {
        return self;
      }

    },
    setState: (obj) => {
      if (obj && typeof obj === 'object') {
        // console.log(obj);
        // duplicate frozen object
        let tempObj = {};
        for (let i in self) {
          tempObj[i] = self[i];
        }

        for (const prop in obj) {
          if (obj.hasOwnProperty(prop)) {
            // console.log(`obj.${prop} = ${obj[prop]}`);
            tempObj[prop] = obj[prop];
          }
        }

        //replace with unfrozen
        self = tempObj;

        Object.freeze(self);

        events.publish('UPDATE', self);
        return self;
      } else {
        console.error('not found');
        return null;
      }

    }

  };

}());


/**
 * SUBSCRIBER for pub-sub
 * when state is set, it calls this 
 */
// eslint-disable-next-line no-unused-vars
const SUBS = events.subscribe('UPDATE', async (state) => {
  //Get data from local or fetch it, and render it
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
 * param {object} params
 * param {[]} [params.cachedFeatures]
 * param {[]} [params.fetchedFeatures]
 * param {string[]} params.errors
 * @return {void} - updates DOM
 */
function baseRender({ data, state }) {
  const features = data.cachedFeatures || data.fetchedFeatures;

  const { expiry, errors } = data;

  if (!errors) {
    const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    const d = new Date();
    const e = new Date(expiry);
    const top5 = parseData.stateTop5(data);
    // console.log(top5);

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

    contextStats.innerHTML = statsSection({
      total: parseData.totalCases(features),
      max: parseData.highestCasePerDayWithDate(features),
      entity: STATE.get('value')
    });

  } else {

    svgWrapper.innerHTML = errors.map(error => {
      return `<div>${error}</div>`;
    }).join('');
  }

}


/**
 * Set preliminary state for geo and entity
 */
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

  contextToFooter();

  //mobile orientation change or resize browser
  window.addEventListener('resize', handleDropdown);
  dropdown.addEventListener('change', handleDropdown);


  if (isMobile()) {
    console.log('isMobile');

    /* Kinda hack to not trigger touch if we are scrolling */
    let start = { x: null, y: null };
    window.addEventListener('pointerdown', (e) => {

      // console.log(`offsetX: ${e.offsetX}, offsetY: ${e.offsetY}`);
      start.x = Math.round(e.offsetX);
      start.y = Math.round(e.offsetY);
    }, false);

    window.addEventListener('pointerup', (e) => {
      let end = {
        x: Math.round(e.offsetX),
        y: Math.round(e.offsetY)
      };

      // Disregard svg-chart touches; only want entities
      //https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action
      if (e.target.id !== 'svg-chart') {
        if (start.x === end.x && start.y == end.y) {
          //touch event
          // console.dir(e);

          window.addEventListener('pointerup', triggerWindowListeners, true);
        } else {
          //just a scroll event - dont need
        }
      }
    }, true);

  } else {
    // console.log('not Mobile');
    window.addEventListener('click', triggerWindowListeners);
  }



  /**
   * MODAL click
   * TODO - doc this
   */
  function smaDaysListener() {
    const smaDays = document.querySelector('#sma-days');

    // smaDays.addEventListener('blur', (e) => {
    //   const value = e.target.value;
    //   // console.log(`ON CLICK value: ${value}, STATE`, STATE.get());
    //   STATE.setState({ smaDays: parseInt(value) });
    //   // console.log(`AFTER value: ${value}, STATE`, STATE.get());
    // }, true);
    smaDays.addEventListener('focusin', (event) => {

      // event.target.style.background = 'pink';    
    });

    smaDays.addEventListener('focusout', (event) => {
      const value = event.target.value;
      // event.target.style.background = '';
      STATE.setState({ smaDays: parseInt(value) });
    });

  }


  /**
   * 
   * @param {Event} e 
   */
  function triggerWindowListeners(e) {
    //GLOBAL EVENT LISTENERS
    let currentElement = document.activeElement;
    // console.log(currentElement);
    if (currentElement.id === 'sma-days') {
      const value = e.target.value;
      event.target.style.background = '';
      STATE.setState({ smaDays: parseInt(value) });
    }



    /* MODAL LISTENERS */
    const modalBackground = document.querySelector('.modal-background');
    const smaCheckbox = document.querySelector('#sma-checkbox');

    // Open SETTINGS Modal
    if (e.target.closest('#settings-icon')) {

      const comp2 = componentSma(STATE);
      const html2 = openModalWith({
        title: 'Settings',
        version: STATE.get('version'),
        props: comp2,
      });

      masterModal.innerHTML = html2;
      masterModal.style.display = 'flex';

      //Add this event listener everytime settings is opened //TODO - fix
      smaDaysListener();

    }

    /* Close the modal */
    if (e.target === modalBackground || e.target.closest('#modal-close')) {
      masterModal.style.display = 'none';
    }


    /** MODAL SETTINGS */
    if (e.target === smaCheckbox) {

      //need to ! this because event doenst register new value, just previous
      // const checked = !e.target.checked;
      // console.log(`ON CLICK - checked: ${checked}, STATE`, STATE.get());
      // console.log(STATE.get('smaIsChecked'));
      let bool = STATE.get('smaIsChecked');
      let s = STATE.setState({ smaIsChecked: !bool });
      //  console.log(s);
    }


    /** 
     * CLOSE MODAL on rect
     * @type {SVGAElement} 
     */
    const closest = e.target.closest(`[data-positive]`);

    if (closest) {
      const html = openModalWith({
        title: 'Details',
        version: STATE.get('version'),
        props: viewAllTheData({
          positive: closest.dataset.positive,
          date: closest.dataset.date,
          period: closest.dataset.period,
          sma: closest.dataset.sma,
        })
      });

      masterModal.innerHTML = html;
      masterModal.style.display = 'flex';
    }

    /** 
     * OPEN MODAL on rect
     * @type {SVGAElement} 
     */
    const sma1 = e.target.closest(`[data-class="sma1"]`);
    if (sma1) {
      const html = openModalWith({
        title: 'Date Details',
        version: STATE.get('version'),
        props: viewSma({
          // positive: closest.dataset.positive,
          period: sma1.dataset.period,
          date: sma1.dataset.date,
          sma: sma1.dataset.sma,
        })
      });

      masterModal.innerHTML = html;
      masterModal.style.display = 'flex';
    }
    // e.preventDefault();
  }

}


/**
 * Dynamically update footer content
 */
function contextToFooter() {
  const version = STATE.get('version');
  const foot = document.querySelector('#context-footer');

  const html = `
  <hr color="black" size="1">
  <div style="
  display: flex; 
  line-height:1.5em;"
  >
    <a target="_blank" style="display:flex; text-decoration: none; stroke:black; margin-right:12px; align-self: flex-end;" href="https://github.com/Perrishnikov/covidBrown">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-github">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
      </a>
      <span style="font-size: .7em;">Project: COVID Brown </span>
      <span id="version" style="font-size: .7em; margin-left:12px;">v${version}</span>
    </div>`;

  foot.innerHTML = html;
}