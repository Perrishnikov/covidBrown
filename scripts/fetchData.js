// `https://services1.arcgis.com/ISZ89Z51ft1G16OK/ArcGIS/rest/services/COVID19_WI/FeatureServer/10/query?outFields=*&where=GEO%20%3D%20'County'%20AND%20NAME%20%3D%20'Rusk'`
async function fetchData(value) {
  const url = `https://services1.arcgis.com/ISZ89Z51ft1G16OK/ArcGIS/rest/services/COVID19_WI/FeatureServer/10/query?where=GEO%3D'County'AND NAME%3D'${value}'&returnGeometry=true&outFields=OBJECTID,GEO,NAME,LoadDttm,NEGATIVE,POSITIVE,DEATHS,POS_NEW,NEG_NEW,TEST_NEW&outSR=4326&f=json`;
  // const url = '../data/sampleQuery2.json'; //local

  const response = await fetch(url); // (2)

  if (response.status == 200) {
    const json = await response.json(); // (3)
    
    const { features, errors } = validateFeatures(json); // (4)

    if (errors.length === 0) {
      const max = parseData.getMaxY(features);
      const days = parseData.getDays(features);

      return { features, errors, max, days };

    } else {
      return { errors }
    }
  } else {
    return new Error(response.status)
  }
};

// returns features and errors if any
function validateFeatures(json) {
  let errors = [];
  let features = [];

  if (json.features && Array.isArray(json.features)) {
    // console.log(json);
    features = json.features;
    //TODO - needs field validation

    return { features, errors };
  } else {
    errors.push('Features not found or is not an array.')
    return { errors };
  }
}

const parseData = {
  getMaxY: data => {
    let max = 60;

    data.forEach(day => {
      // console.log(day.attributes.POS_NEW);
      if (day.attributes.POS_NEW > max) {
        max = day.attributes.POS_NEW;
      }
    });
    return max;
  },
  getDays: data => {
    return data.length;
  }
}