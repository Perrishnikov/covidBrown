function storageAvailable(type) {
  var storage;
  try {
    storage = window[type];
    var x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    // console.log(`localStorage available`);
    return true;
  }
  catch (e) {
    return e instanceof DOMException && (
      // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      (storage && storage.length !== 0);
  }
}


function getWithExpiry(key) {
  const itemStr = localStorage.getItem(key);

  // if the item doesn't exist, return null
  if (!itemStr) {
    console.log(`${key} not found`);
    return null;
  }

  //convert the item to a JSON string, since we can only store strings in localStorage.
  const item = JSON.parse(itemStr);
  const now = new Date();

  // compare the expiry time of the item with the current time
  if (now > new Date(item.expiry)) {
    // If the item is expired, delete the item from storage and return null
    console.log('removing key for ', key);
    localStorage.removeItem(key);
    return null;
  }

  console.log(`cached value found for ${key}`);
  return item.value;
}


function setWithExpiry(key, value) {
  const expirationTime = 14; // 2:00 pm

  const now = new Date();
  const nowTime = now.toLocaleTimeString();
  const twoTime = new Date();
  twoTime.setHours(expirationTime, 00, 0); // 2:00 pm
  const twoOclock = twoTime.toLocaleTimeString();

  /**@type {Date} */
  let expiry = new Date();
  expiry.setHours(14, 00, 0);

  //if it's after 2:00, set date for tomorrow
  if (nowTime > twoOclock) {
    expiry.setDate(new Date().getDate() + 1);
  } else {
    expiry.setDate(new Date().getDate());
  }
  // `item` is an object which contains the original value
  // as well as the time when it's supposed to expire
  const item = {
    value: value,
    expiry: expiry
  };

  console.log('setting localStorage for ', key);
  localStorage.setItem(key, JSON.stringify(item));
  // let k = localStorage.getItem(key);
  // console.log(k);
}