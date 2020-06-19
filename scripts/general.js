/* eslint-disable no-unused-vars */

/**
 * Use Fetch 
 * @param {string} url 
 */
async function fetchData(url) {
  const response = await fetch(url);

  if (response.status == 200) {
    const json = await response.json();

    if (json) {
      return { json, errors: [] };
    } else {
      return { errors: ['Features not found or is not an array.'] };
    }
  } else {
    return { errors: [new Error(response.status)] };
  }
}


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
  // console.log(key);
  const itemStr = localStorage.getItem(key);

  if (!itemStr) {
    console.log(`${key} not found`);
    return { data: null, expiry: null };
  }

  //convert the item to a JSON string, since we can only store strings in localStorage.
  const item = JSON.parse(itemStr);
  const now = new Date();
  const expDate = new Date(item.expiry);

  // compare the expiry time of the item with the current time
  if (now > expDate) {
    // If the item is expired, delete the item from storage and return null
    console.log(`removing key for ${key}`);
    localStorage.removeItem(key);
    return { data: null, expiry: null };
  }

  console.log(`cached value found for ${key} with expiry of ${expDate.toLocaleTimeString()} on ${expDate.toLocaleDateString()}`);
  return { data: item.value, expiry: expDate };
}


/**
 * Gets value from localStorage if exists,
 * Removes item if expired
 * @param {string} key
 * @param {[]} value
 * @returns {null|string}
 */
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

export { storageAvailable, getWithExpiry, setWithExpiry, fetchData };