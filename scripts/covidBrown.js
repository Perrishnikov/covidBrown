/**
 *`https://services1.arcgis.com/ISZ89Z51ft1G16OK/ArcGIS/rest/services/COVID19_WI/FeatureServer/10/query?outFields=*&where=GEO%20%3D%20'County'%20AND%20NAME%20%3D%20'Rusk'`
 * @param {string} value 
 * @param {'county'|'state'} geo 
 */
function getUrl(value, geo) {
  // const url = '../data/sampleQuery2.json'; //local
  const url = `https://services1.arcgis.com/ISZ89Z51ft1G16OK/ArcGIS/rest/services/COVID19_WI/FeatureServer/10/query?where=GEO%3D'${geo}'AND NAME%3D'${value}'&returnGeometry=true&outFields=OBJECTID,GEO,NAME,LoadDttm,NEGATIVE,POSITIVE,DEATHS,POS_NEW,NEG_NEW,TEST_NEW&outSR=4326&f=json`;

  return url;
}

/**
 * returns features and errors if any
 * data model. use this for @type in (localStorage.js)?
 * @param {JSON} json
 * @returns {{features:object, errors:[]}}
 */
function validateFeatures(json) {
  //TODO - needs field validation
  const { features, fields } = json;
  // console.log(features);
  let validationErrors = [];

  if (features && Array.isArray(features)) {

    return { features, validationErrors };
  } else {
    validationErrors.push('Features not found or is not an array.');
    return { validationErrors };
  }
}

/**
 * @type {{
 * highestCasesPerDay: (data:[]) => number,
 * numOfDays: (data:[]) => number,
 * averagePOS_NEW: (data:[]) => {average:number, sum:number},
 * smaPOS_NEW: (data:[], period:number) => {period:number, sma:{date:Date, value:number}[]}
 * }
 */
const parseData = {
  highestCasesPerDay: data => {
    let max = 30;

    data.forEach(day => {
      // console.log(day.attributes.POS_NEW);
      if (day.attributes.POS_NEW > max) {
        max = day.attributes.POS_NEW;
      }
    });
    return max;
  },

  numOfDays: data => {
    return data.length;
  },

  averagePOS_NEW: (data) => {
    const sum = data.reduce((prev, curr, index) => {
      // console.log(data[index]);
      curr = data[index].attributes.POS_NEW;
      return prev + curr;
    }, 0);
    const average = Math.round((sum / data.length)) || 0;

    // console.log(`The sum is: ${sum}. The average is: ${average}.`);
    return { average, sum };
  },

  smaPOS_NEW: (data, period) => {
    /**@type {Date} */
    let date;
    /**@type {number} */
    let value;
    const sma = data.map((element, index, arr) => {
      date = new Date(arr[index].attributes.LoadDttm).toLocaleDateString();

      if (index < period) {
        value = null;

      } else {
        const slice = arr.slice(index - period, index);

        value = parseData.averagePOS_NEW(slice);
      }

      return { date, value, period };
    });

    return { sma, period };
  },


  stateTop5: (features) => {
    const [...data] = features.cachedFeatures || features.fetchedFeatures;
    if(data[0].attributes.GEO === 'State'){

      let sorted = data.sort((a,b) => {
        // console.log(a);
        // console.log(b);
        return a.attributes.POS_NEW - b.attributes.POS_NEW;
      });

      // sorted.forEach(t => console.log(t.attributes.POS_NEW));
      // console.log(data[0].attributes);
      return sorted;
    }
    
  }
};

export { getUrl, parseData, validateFeatures };