/* eslint-disable no-unused-vars */

/**
 * Checks browser for localStorage
 * https://www.sohamkamani.com/blog/javascript-localstorage-with-ttl-expiry/
 * @param {'localStorage'} type 
 * @returns {boolean}
 */
function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    let x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  }
  catch (e) {
    return false;
  }
}


/**
 * Gets value from localStorage if exists,
 * Removes item if expired
 * @param {string} key
 * @returns {null|string}
 */
async function getWithExpiry(key) {
  const itemStr = localStorage.getItem(key);

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
    console.log(`removing key for ${key}`);
    localStorage.removeItem(key);
    return null;
  }

  console.log(`cached value found for ${key}`);
  return item.value;
}


async function setWithExpiry(key, value) {
  const expirationTime = 14; // 2:00 pm

  const now = new Date();
  const nowTime = now.toLocaleTimeString();
  const twoTime = new Date();
  twoTime.setHours(expirationTime, 0, 0); // 2:00 pm
  const twoOclock = twoTime.toLocaleTimeString();


  let expiry = new Date();
  expiry.setHours(14, 0, 0);

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

  console.log(`setting localStorage for ${key}`);
  localStorage.setItem(key, JSON.stringify(item));
  // let k = localStorage.getItem(key);
  // console.log(k);

  return key;
}