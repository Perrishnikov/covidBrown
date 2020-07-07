# covidBrown

https://perrishnikov.github.io/covidBrown/


## v1.4
* Top 5 added
* fixed scroll/touching of bars on mobile
* Stats - total cases
* Stats - highest single day

## v1.3.1
* increased size of touch events for fingers

## v1.3
* link to github
* touch svg elements w/ popup
* refactor

## v1.2
* added pub-sub
* refactored
* state management
* settings - sma 

## v1.1
* scrollMax to right
* added Expires date 
* added settings modal - no settings yet
* dynamic numbers depending on height 
* refactor
* version tracking

## v1
* MVP

## TODO
* fix iOS resizing number input bug
* clean up dates
* clean up stying, css, and id's
* create legend
* top 5 counties on WI chart. Add to stats
* multi-select
This example shows how to iterate through a collection of objects collected by querySelectorAll. This is because querySelectorAll returns a NodeList (which is a collection of objects).

In this case, we return all the selected options' values on the screen:
```
let elems = document.querySelectorAll('select option:checked')
let values = Array.prototype.map.call(elems, function(obj) {
  return obj.value
})
```
* url (query string) for direct link - "/geo="state"&entity=WI"
* console.log(window.matchMedia('(prefers-color-scheme: dark)').matches);
  https://davidwalsh.name/prefers-color-scheme
* change orientation to breakpoints. Check for iOS for font-size
* look into resolution for mobile (window.devicePixelRatio}dppx)
* stats
  1. entity population with percentages of infected
* multiple sma's?