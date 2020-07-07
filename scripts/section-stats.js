
function statsSection({ total, entity, max }) {

  return html`
  <div style="display: flex; flex-direction: column; margin-left: 30px; margin-top:12px; margin-bottom:12px; line-height:1.5em;">
    <div style="font-weight: 700;">Stats for ${entity}</div>
    <div style="display: flex; flex-direction: column;">

      <div style="display: flex; flex-direction: column; align-items: flex-start; font-size:1em; ">
        <div style="">
          <span>Total Cases:</span>
          <span style="margin-right: 12px;" id="">${numberWithCommas(total)}</span>
        </div>
        <div style="">
        <span>Highest Single Day:</span>
          <span style="" id="">${numberWithCommas(max.max)}</span>
          <span> on ${max.date}</span>
        </div>
      
    </div>
  </div>
  
  `;
}

export { statsSection };

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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

