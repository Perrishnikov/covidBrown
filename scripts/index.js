window.onload = () => {
  const todaysDate = document.querySelector('#todaysDate');
  const wrapper = document.querySelector('#svg-wrapper');

  document.querySelector('#county-drop')
    .addEventListener('change', e => {
      const value = e.target.value;

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
        //else, fetch new item and set cached item
        else {
          fetchData(value).then(data => {
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
      else {
        // Too bad, no localStorage for us
      }

    });

  //TODO - get state numbers.
  //TODO - console.log(window.matchMedia('(prefers-color-scheme: dark)').matches);
  //TODO - summarize county data
  //TODO - 7 day average
}
