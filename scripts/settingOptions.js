function componentSma() {

  return html`
  <label style="display: flex; align-items: center;" class="">
    <input id="showChartAverage" type="checkbox"/>
    <span style="margin-left: 6px;">Show </span>
    <input style="width:35px; background-color: beige; margin-left: 6px; margin-right: 6px; text-align: center;" id="chartAverageDays" class="input" type="number" value="7">
    <span> SMA over </span>
  </label>`;
}

export { componentSma };

//use template literal intellisense
const html = string => string;