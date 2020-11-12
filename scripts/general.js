/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-vars */

/**
 * Use Fetch 
 * @param {string} url 
 */
async function fetchData(url) {
  const response = await fetch(url);

  console.log(response);
  if (response.status == 200) {
    const json = await response.json();

    //  console.log(json);

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
  const itemStr = localStorage.getItem(key);

  // console.log(itemStr);
  //if not in localStorage...
  if (!itemStr) {
    console.log(`${key} not found - go fetch`);
    return { data: null, expiry: null };
  }
  else {
    //convert the item to a JSON string, since we can only store strings in localStorage.
    const item = JSON.parse(itemStr);
    const now = new Date();
    const expDate = new Date(item.expiry);
    // console.log(`${key} found in storage---\nnow: ${now},\nexpDate: ${expDate}`);
    // compare the expiry time of the item with the current time
    if (now > expDate) {
      // If the item is expired, delete the item from storage and return null
      console.log(`removing expired values for ${key}`);
      localStorage.removeItem(key);
      return { data: null, expiry: null };
    }

    console.log(`cached value found for ${key} with expiry of ${expDate.toLocaleTimeString()} on ${expDate.toLocaleDateString()}`);

    return { data: item.value, expiry: expDate };
  }
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

  const nowTime = new Date();
  const twoTime = new Date();
  twoTime.setHours(expirationTime, 0, 0); // 2:00 pm

  // const twoOclock = twoTime.toLocaleTimeString();
// console.log(`nowTime: ${nowTime}`);
// console.log(`twoTime: ${twoTime}`);

  let expiry = new Date();
  expiry.setHours(expirationTime, 0, 0);

  //to pad with
  const newDate = new Date();

  //if it's after 2:00, set date for tomorrow
  if (nowTime >= twoTime) {
    
    // console.log(`set Cache for Date +1`);
    expiry.setDate(new Date().getDate() + 1); //tomorrow at 2:00
  } else {
    // console.log(`set Cache for Date +0`);
    expiry.setDate(new Date().getDate()); //today at 2:00
  }
  // `item` is an object which contains the original value
  // as well as the time when it's supposed to expire
  const item = {
    value: value,
    expiry: expiry
  };

  console.log(`setting localStorage for ${key} on ${expiry}`);
  localStorage.setItem(key, JSON.stringify(item));
  // let k = localStorage.getItem(key);
  // console.log(k);

  return key;
}

function isMobile() {
  let check = false;
  (function (a) {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
}

export { storageAvailable, getWithExpiry, setWithExpiry, fetchData, isMobile };