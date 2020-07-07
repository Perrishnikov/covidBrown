/* eslint-disable lit/no-duplicate-template-bindings */

/**
 * 
 */
function componentSma(props) {
  const { smaIsChecked, smaDays } = props.get();
  // console.log(`smaIsChecked: ${smaIsChecked}, smaDays: ${smaDays}`);
  
  const h = html`
  <div style="display: flex; align-items: center;" class="">
    <input id="sma-checkbox" type="checkbox" ${smaIsChecked ? 'checked' : ''} />
    <span style="margin-left: 6px;">Show SMA over</span>
    <input id="sma-days" inputmode="numeric" style="width:35px; background-color: beige; margin-left: 6px; margin-right: 6px; text-align: center; font-size: 16px !important;" class="input" type="number" value="${smaDays ? smaDays : 0}" />
    <span> days </span>
</div>`;

  return h;
}


// function viewDataPositive({ positive, date }) {

//   return html`
//   <div style="display: flex; align-items: center; font-size:1.1em;">
//     <div style="line-height:1.5em; display: flex; flex-direction: column; align-items: flex-end; justify-content:space-between; margin-right:12px;">
//       <span>Date:</span>
//       <span>Positive:</span>
//     </div>
//     <div style="display: flex; flex-direction: column; align-items: start; justify-content:space-between; line-height:1.5em;">
//       <span id="">${date}</span>
//       <span id="">${positive} cases</span>
//     </div>
//   </div>
//   `;
// }

function viewSma({ period, date, sma }) {
  return html`
  <div style="display: flex; align-items: center; font-size:1.1em;">
    <div style="line-height:1.5em; display: flex; flex-direction: column; align-items: flex-end; justify-content:space-between; margin-right:12px;">
      <span>Date:</span>
      <span>SMA:</span>
      <span>Period:</span>
    </div>
    <div style="display: flex; flex-direction: column; align-items: start; justify-content:space-between; line-height:1.5em;">
      <span id="">${date}</span>
      <span id="">${sma} cases</span>
      <span id="">${period} days</span>
    </div>
  </div>
  `;
}

function viewAllTheData({ period, date, sma, positive }) {
  return html`
  <div style="display: flex; align-items: center; font-size:1.1em;">
    <div style="line-height:1.5em; display: flex; flex-direction: column; align-items: flex-end; justify-content:space-between; margin-right:12px;">
      <span>Date:</span>
      <span>New Positive:</span>
      <span>SMA:</span>
      <span>SMA Period:</span>
    </div>
    <div style="display: flex; flex-direction: column; align-items: start; justify-content:space-between; line-height:1.5em;">
      <span id="">${date}</span>
      <span id="">${positive} cases</span>
      <span id="">${sma} cases</span>
      <span id="">${period} days</span>
    </div>
  </div>
  `;
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
        ${props}
      </section>

      <footer class="modal-card-foot">

        <a target="_blank" style="display:flex; text-decoration: none; stroke:black; margin-right:12px; align-self: flex-end;" href="https://github.com/Perrishnikov/covidBrown">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-github">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
        </a>
        <span style="font-size: .7em;">Project: COVID Brown </span>
        <span id="version" style="font-size: .7em; margin-left:12px;">v${version}</span>

      </footer>
    </div>
  <!-- </div> -->
  `;
}

export { componentSma, openModalWith, viewSma, viewAllTheData };

//use for template literal intellisense
const html = (strings, ...keys) => {
  // console.log(keys);
  // console.log(strings);
  let result = [strings[0]];
  keys.forEach(function (key, i) {
    result.push(key, strings[i + 1]);
  });
  return result.join('');
};

