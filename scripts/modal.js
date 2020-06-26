/* eslint-disable lit/no-duplicate-template-bindings */

/**
 * 
 */
function componentSma(props) {
  const { smaIsChecked, smaDays } = props.get();

  const h = html`
  <label style="display: flex; align-items: center;" class="">
    <input id="sma-checkbox" type="checkbox" checked=${smaIsChecked ? smaIsChecked : ''} />
    <span style="margin-left: 6px;">Show SMA over</span>
    <input id="sma-days" style="width:35px; background-color: beige; margin-left: 6px; margin-right: 6px; text-align: center;" class="input" type="number" value="${smaDays ? smaDays : 0}" />
    <span> days </span>
  </label>`;

  return h;
}


function viewForPositive(props) {

}

//title
//settings for Settings and Data for Details
//footer should be static

function openModalWith({ version, title, props }) {

  return html`
  <!-- <div id="masterModal" class="modal"> -->
    <div class="modal-background"></div>

    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">${title}</p>

        <span style="display:flex;" id="modal-close" class="button">
          <img class="icon" type="image/svg+xml" src="assets/x-circleX.svg" />
        </span>
      </header>

      <section class="modal-card-body">
        <div id="setting-options" class="content">
          <!-- <p>Coming Soon</p> -->
          ${props}
        </div>

        <!-- Content ... -->
      </section>

      <footer class="modal-card-foot">

        <a target="_blank" style="display:flex; text-decoration: none; stroke:black; margin-right:12px; align-self: flex-end;" href="https://github.com/Perrishnikov/covidBrown">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-github">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
        </a>
        <span style="font-size: .7em;">Project: COVID Brown </span>
        <span id="version" style="font-size: .7em; margin-left:12px;">${version}</span>

      </footer>
    </div>
  <!-- </div> -->
  `;
}

export { componentSma, viewForPositive, openModalWith };

//use template literal intellisense
const html = (strings, ...keys) => {
  // console.log(keys);
  // console.log(strings);

  // return (function(...values) {
  // let dict = values[values.length - 1] || {};
  let result = [strings[0]];
  keys.forEach(function (key, i) {
    // let value = Number.isInteger(key) ? values[key] : dict[key];
    // result.push(value, strings[i + 1]);
    result.push(key, strings[i + 1]);
    // result.push();
  });
  return result.join('');
  // });

};

