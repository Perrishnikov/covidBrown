import fetchData from '/scripts/fetchData.js';
import chartAttack from '/scripts/chartAttack.js';
import { parseData } from '/scripts/fetchData.js';



window.onload = () => {
  const todaysDate = document.querySelector('#todaysDate');
  const wrapper = document.querySelector('#svg-wrapper');

  document.querySelector('#county-drop')
    .addEventListener('change', e => {
      const value = e.target.value;

      fetchData(value).then(data => {
        const { features, errors, max, days } = data;

        if (errors.length === 0) {
          const d = new Date();

          //update DOM
          wrapper.innerHTML = chartAttack(days, max, features);

          todaysDate.innerHTML = `${d.getMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`;

        } else {
          //TODO - add errors to DOM
          errors.forEach(error => {
            console.error(error);
          });
        }

      });
    });

  // fetchData('Brown').then(data => {
  //   const { features, errors, max, days } = data;

  //   if (errors.length === 0) {
  //     const d = new Date();

  //     wrapper.innerHTML = chartAttack(days, max, features);

  //     todaysDate.innerHTML = `${d.getMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`;
  //   } else {
  //     //TODO - add errors to DOM
  //     errors.forEach(error => {
  //       console.error(error);
  //     });
  //   }

  // });
  //TODO - get state numbers.
  //TODO - cache the query
  //TODO - console.log(window.matchMedia('(prefers-color-scheme: dark)').matches);
  //TODO - summarize county data
  //TODO - 7 day average

}
