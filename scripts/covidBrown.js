/**
 https://services1.arcgis.com/ISZ89Z51ft1G16OK/ArcGIS/rest/services/COVID19_WI/FeatureServer/10/query?outFields=*&where=GEO%20%3D%20'County'%20AND%20NAME%20%3D%20'Rusk'

 https://data.dhsgis.wi.gov/datasets/covid-19-historical-data-table/data?page=12&where=GEO%20%3D%20%27state%27%20AND%20NAME%20%3D%20%27WI%27

 * @param {string} value 
 * @param {'county'|'state'} geo 
 */
function getUrl(value, geo) {
  console.log(`value: ${value}, geo: ${geo}`);
  // const url = '../data/sampleQuery2.json'; //local
  // const url = `https://services1.arcgis.com/ISZ89Z51ft1G16OK/ArcGIS/rest/services/COVID19_WI/FeatureServer/10/query?where=GEO%3D'${geo}'AND NAME%3D'${value}'&returnGeometry=true&outFields=OBJECTID,GEO,NAME,NEGATIVE,POSITIVE,DEATHS,DTH_NEW,POS_NEW,NEG_NEW,TEST_NEW,DATE&outSR=4326&f=json&orderByFields=DATE&resultRecordCount=365`;

  // const url = `https://dhsgis.wi.gov/server/rest/services/DHS_COVID19/COVID19_WI/FeatureServer/1/query?where=GEO%3D'${geo}'AND NAME%3D'${value}'&outFields=OBJECTID,GEO,NAME,NEGATIVE,POSITIVE,DEATHS,DTH_NEW,POS_NEW,NEG_NEW,TEST_NEW,DATE%2CDATE&f=json&orderByFields=DATE&resultRecordCount=365`;

  //! helpful link: https://dhsgis.wi.gov/server/rest/services/DHS_COVID19/COVID19_WI/FeatureServer/11

  if (geo == 'state') {
    // const forWi = `https://dhsgis.wi.gov/server/rest/services/DHS_COVID19/COVID19_WI/FeatureServer/11/query?where=1=1&outFields=OBJECTID,GEO,NAME,NEGATIVE,POSITIVE,DEATHS,DTH_NEW,POS_NEW,NEG_NEW,TEST_NEW,DATE&returnGeometry=false&f=json&orderByFields=DATE`;

    //11-12-20
    const forWi = `https://dhsgis.wi.gov/server/rest/services/DHS_COVID19/COVID19_WI/MapServer/11/query?where=1=1&outFields=OBJECTID,GEO,NAME,NEGATIVE,POSITIVE,DEATHS,DTH_NEW,POS_NEW,NEG_NEW,TEST_NEW,DATE&returnGeometry=false&f=json&orderByFields=DATE`;

    return forWi;
  } else {
    //10-11
    // const allCountiesUrl = `https://dhsgis.wi.gov/server/rest/services/DHS_COVID19/COVID19_WI/FeatureServer/12/query?where=GEO%3D'${geo}'AND NAME%3D'${value}'&outFields=OBJECTID,GEO,NAME,NEGATIVE,POSITIVE,DEATHS,DTH_NEW,POS_NEW,NEG_NEW,TEST_NEW,DATE%2CDATE&f=json&orderByFields=DATE&resultRecordCount=365`;

    //11-12-20
    const allCountiesUrl = `https://dhsgis.wi.gov/server/rest/services/DHS_COVID19/COVID19_WI/MapServer/12/query?where=GEO%3D'${geo}'AND NAME%3D'${value}'&outFields=OBJECTID,GEO,NAME,NEGATIVE,POSITIVE,DEATHS,DTH_NEW,POS_NEW,NEG_NEW,TEST_NEW,DATE%2CDATE&f=json&orderByFields=DATE&resultRecordCount=730`;



    return allCountiesUrl;
  }



}


function getTop5Url(date) {

  // format = 07/17/2020

  //https://enterprise.arcgis.com/en/portal/latest/use/work-with-date-fields.htm
  const oldTop5 = `https://services1.arcgis.com/ISZ89Z51ft1G16OK/ArcGIS/rest/services/COVID19_WI/FeatureServer/10/query?where=GEO %3D 'County' AND DATE %3D '${date} 2:00:00:00 PM'&returnGeometry=false&outFields=OBJECTID,GEO,NAME,NEGATIVE,POSITIVE,DEATHS,DTH_NEW,POS_NEW,NEG_NEW,TEST_NEW,DATE&outSR=4326&f=json&orderByFields=POS_NEW DESC&resultRecordCount=10`;

  const newTop5 = `https://services1.arcgis.com/ISZ89Z51ft1G16OK/ArcGIS/rest/services/COVID19_WI/FeatureServer/10/query?where=GEO = 'county' AND DATE >= TIMESTAMP '${date} 14:00:00' AND DATE <= TIMESTAMP '${date} 23:59:59'&returnGeometry=false&outFields=OBJECTID,GEO,NAME,NEGATIVE,POSITIVE,DEATHS,DTH_NEW,POS_NEW,NEG_NEW,TEST_NEW,DATE&f=json&orderByFields=POS_NEW DESC&resultRecordCount=10`;

  //11-12-20
  const newerTop5 = `https://dhsgis.wi.gov/server/rest/services/DHS_COVID19/COVID19_WI/MapServer/12/query?returnGeometry=false&f=json&orderByFields=POS_NEW DESC&resultRecordCount=10&where=GEO = 'county' AND DATE >= TIMESTAMP '${date} 14:00:00' AND DATE <= TIMESTAMP '${date} 23:59:59'&outFields=OBJECTID,GEO,NAME,NEGATIVE,POSITIVE,DEATHS,DTH_NEW,POS_NEW,NEG_NEW,TEST_NEW,DATE`;

  return newerTop5;
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
      date = new Date(arr[index].attributes.DATE).toLocaleDateString();

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


  totalCases: features => {
    const [...clone] = features;

    const reduced = clone.reduce((acc, curr) => {
      return acc + curr.attributes.POS_NEW;
    }, 0);

    return reduced;
  },

  highestCasePerDayWithDate: data => {
    let max = 0;
    let date = '';

    data.forEach(day => {
      // console.log(day.attributes.POS_NEW);
      if (day.attributes.POS_NEW > max) {
        max = day.attributes.POS_NEW;

        date = new Date(day.attributes.DATE).toLocaleDateString();
      }
    });
    return { max, date };
  },

  doSomethingDeaths: features => {
    const [...clone] = features;

    const reduced = clone.reduce((acc, curr) => {
      return acc + curr.attributes.DTH_NEW;
    }, 0);

    return reduced;
  }
};

export { getUrl, parseData, validateFeatures, getTop5Url };
