
//[x]TODO - get state numbers.
//TODO - adjust scale to screen height
//TODO - console.log(window.matchMedia('(prefers-color-scheme: dark)').matches);
//TODO - summarize county data
//TODO - 7 day average - display options

const todaysDate = document.querySelector('#todaysDate');
const wrapper = document.querySelector('#svg-wrapper');
const dropdown = document.querySelector('#county-drop');


window.onload = () => {
  /**@type {'state'|'county'} */
  const geo = dropdown.selectedOptions[0].dataset.geo;
  /**@type {string} - county (or state) */
  const selected = dropdown.options[dropdown.selectedIndex].value;

  // onload, get selected (WI) data
  updateDOM(selected, geo);

  // onchange, get county data
  dropdown.addEventListener('change', e => {
    /**@type {'state'|'county'} */
    const geo = e.target.selectedOptions[0].dataset.geo;
    /**@type {string} */
    const value = e.target.value;

    updateDOM(value, geo);
  });
}


/**
 * 
 * @param {string} value - county name
 * @param {'county'|'state'} geo 
 * @returns {void} - manipulates DOM
 */
function updateDOM(value, geo) {

  if (storageAvailable('localStorage')) {
    const d = new Date();

    const cachedValue = getWithExpiry(value);

    if (cachedValue) {
      const features = cachedValue;
      const max = parseData.getMaxY(features);
      const days = parseData.getDays(features);

      // update DOM
      wrapper.innerHTML = chartAttack(days, max, features);

      todaysDate.innerHTML = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} (cached)`;
    }
    /* else, fetch new item and set cached item */
    else {
      fetchData(value, geo).then(data => {
        const { features, errors, max, days } = data;

        if (errors.length === 0) {

          setWithExpiry(value, features);

          //update DOM
          wrapper.innerHTML = chartAttack(days, max, features);

          todaysDate.innerHTML = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;

        } else {
          //TODO - add errors to DOM
          errors.forEach(error => {
            console.error(error);
          });
        }

      });

    }
  }
  /* no localStorage */
  else {
    console.error('Too bad, no localStorage for you');
  }
}
