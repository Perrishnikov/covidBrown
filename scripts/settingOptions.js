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

export { componentSma };

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

