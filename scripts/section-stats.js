
function statsSection({ total, entity, max }) {

  return html`
  <hr style="margin-left:12px; margin-right:12px;" color="black" size="1">
  <div style="
    display: flex; 
    flex-direction: column; 
    margin:12px; 
    line-height:1.5em;"
    >
    <div style="font-weight: 700;">Stats for ${entity}</div>
    <div style="display: flex; flex-direction: column;">

      <div style="display: flex; flex-direction: column; align-items: flex-start; font-size:1em; ">
        <div>
          <span style="margin-right:6px;">Total Cases:</span>
          <span style="font-weight: 700;">${numberWithCommas(total)}</span>
          <span>as of ${new Date().toLocaleDateString()}</span>
        </div>
        <div>
        <span style="margin-right:6px;">Highest Single Day:</span>
          <span style="font-weight: 700;">${numberWithCommas(max.max)}</span>
          <span> on ${max.date}</span>
        </div>
      
    </div>
  </div>
  
  `;
}

export { statsSection };

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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

