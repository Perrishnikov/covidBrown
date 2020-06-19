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

/* eslint-disable-next-line */
const parseData = {
  highestCasesPerDay: data => {
    let max = 60;

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
  }
};

export { getUrl, parseData, validateFeatures };