function chartAttack(params) {
  const { days, max, features } = params;
  // console.log(`days: ${days}, max: ${max}`);
  const startX = 60;

  //TODO = pixels between y labels (10) & number increments (10)

  //x stuff
  const barWidth = 9;
  const barSpacing = 9;
  let bars = '';
  let xLabels = '';

  //y stuff
  const yPixelsPer = 2;
  const yLabelSpacing = 10;
  const height = ((max % yLabelSpacing) + max + yLabelSpacing) * yPixelsPer;
  const tableHeight = height + 26;
  let yLines = '';
  let yLabels = '';

  //table id="county"
  const width = (days * (barWidth + barSpacing));

  //vertical numbers
  for (let i = 0; i < height; i += yLabelSpacing * yPixelsPer) {
    yLabels += `<text x="${startX - 5}" y="${height - i + 4}">${i / yPixelsPer}</text>`;
  }

  //vertical lines - gray
  for (let i = height; i > 0; i -= yLabelSpacing * yPixelsPer) {
    yLines += `<line stroke="gray" x1="${0}" y1="${i}" x2="${width + barSpacing}" y2="${i}"></line>`;
  }


  //horizontal bars
  for (let i = 0; i < features.length; i++) {
    const att = features[i].attributes;

    bars += `<rect 
      x="${0 + 10 + i * (barWidth + barSpacing)}" 
      y="${height - att.POS_NEW * yPixelsPer}" 
      width="${barWidth}px" 
      height="${att.POS_NEW * yPixelsPer}px" 
      data-positive="${att.POS_NEW}"/>`;

    //adjust spacing for double digit dates
    if (i % 2 == 0) {
      let half = (barWidth + barSpacing) / 2;
      let date = new Date(att.LoadDttm);
      // console.log(`${date.getMonth()+ 1}/${date.getDate()}`);
      let display = `${date.getMonth() + 1}/${date.getDate()}`;
      if (display.toString().length == 2) half += 3;
      if (display.toString().length == 3) half += 6;
      if (display.toString().length == 4) half += 9;

      xLabels += `<text x="${0 + 10 + i * (barWidth + barSpacing) + half}" y="${height + 15}">${display}</text>`;
    }
  }

  // const wrapper = document.querySelector('#svg-wrapper');
  return `
    <div>
      <svg width="${startX + 3}" height="${tableHeight}">
        <title id="title">Brown County Covid Cases</title>

        <g class="labels y-labels" transform="translate(0)">
          ${yLabels}
        </g>

        <g id="yAxis">
          <line x1="${startX}" y1="0" x2="${startX}" y2="${height}"></line>
        </g>

        <text x="${startX / 2}" y="${tableHeight / 2 - 6}" transform="rotate(-90,${startX / 2},${tableHeight / 2})" class="label-title">New Cases</text>

        <line class="xAxis" x1="${startX}" y1="${height}" x2="${width}" y2="${height}"></ line>

      </svg>
    </div>

    <div style="overflow-x: scroll; overscroll-behavior-x: none;">
      <svg x="${0}" height="${tableHeight}" width="${width + startX}" class="labels x-labels">
        <g>
          ${yLines}
        </g>
        <g>
          ${bars}
        </g>
        <g class="bars-labels">
          ${xLabels}
        </g>

        <g id="xAxis">
          <line class="xAxis" x1="${0}" y1="${height}" x2="${width + barSpacing}" y2="${height}"></ line>
        </g>
        <line class="xAxis" x1="${0}" y1="${0}" x2="${width + barSpacing}" y2="${0}"></ line>

      </svg>
    </div>
  `;
}

//devicePixelRatios 
//okay: 2.625 (Pixel 2), 3.5 (Pixel 2 XL), 3 (XS), 4 

/**
 * 
 * @param {{sma: {date:Date, period:number, value:number|null}[], period:number}} data 
 * @returns void - Update DOM
 */
function makeSma(data){
  //TODO
}

/**
 * @param {object} params 
 * @param {number} params.numOfDays
 * @param {number} params.highestCasesPerDay
 * @param {number} params.windowHeight
 * @param {'portrait'|'landscape'} params.orientation
 * @param {[]|null} params.sma
 */
function dynamicChart(params) {
  const { data, numOfDays, highestCasesPerDay, windowHeight, orientation, sma } = params;

  //x-axis
  let xAxisLabels = ''; //data labels (dates)
  let xBars = ''; //data values (number)
  const barWidth = 9;
  const barSpacing = 9;
  const chartWidth = (numOfDays * (barWidth + barSpacing));

  //y-axis
  let yAxisValues = ''; //count (cases)
  let yAxisLines = ''; //appended by for loop
  const yAxisWidth = 50; //width of y-axis area
  const yLabelMargin = 20; //space at bottom for dates
  const chartHeight = windowHeight - yLabelMargin; //285 or 722

  // console.assert(orientation === 'landscape'  && chartHeight / 40 > 10.5, `chartHeight ration is too small ${chartHeight} ...${chartHeight / 40} adjust p.yLineCount `); //<420

  //orientation
  let l = {
    yLineCount: 19, //number of y ticks (makes x line) - rounded up (+1) 
    yTextPadding: 10,
  };
  let p = {
    yLineCount: 39, // 
    yTextPadding: 10,
  };
  const yLineCount = orientation === 'landscape' ? l.yLineCount : p.yLineCount;
  const yTextPadding = orientation === 'landscape' ? l.yTextPadding : p.yTextPadding;

  //calculated
  const yMaxValue = Math.ceil(highestCasesPerDay / yLineCount) * yLineCount; //round this up
  const yLineInc = (chartHeight - l.yTextPadding * 2) / yLineCount; //pixel increment per line
  const yNumbInc = yMaxValue / yLineCount; // number increment per line
  const ppxPerNumber = roundToNearestHundredth(yLineInc / yNumbInc); //easy on the rounding here - can break if less than .00

  // console.log(`screen width: ${screen.width}, height: ${screen.height}, pixelRatio: ${window.devicePixelRatio}........`);
  //calculated
  // console.log(`yLineInc: ${yLineInc} (px spacing per line); yNumbInc: ${yNumbInc}; ppxPerNumber: ${ppxPerNumber}`); //line inc
  // console.log(`max: ${max}, yMaxValue: ${yMaxValue}, chartHeight: ${chartHeight}px;`);
  // console.log(`w.innerHeight: ${window.innerHeight}, contextWrapper.clientHeight: ${contextWrapper.clientHeight} = chartHeight: ${chartHeight}`);

  //yAxis lines and values
  let count = 0;
  for (let i = yTextPadding; i < chartHeight; i += yLineInc) {
    const yNumberCount = yMaxValue - (count * yNumbInc);
    // console.log(`y location: ${i}`); console.count()
    //lines (by i == pixel location for each line)
    yAxisLines += `<line class="xAxis" x1="${0}" y1="${i}" x2="${chartWidth}" y2="${i}"></line>`;

    //numbers (by yMax)
    yAxisValues += `<text x="${yAxisWidth - 2}" y="${i + 5}">${yNumberCount}</text>`;
    count++;
  }

  //horizontal bars
  for (let i = 0; i < data.length; i++) {
    const att = data[i].attributes;
    const POS_NEW = att.POS_NEW > 0 ? att.POS_NEW : 0;
    const yOffset = chartHeight - (yLineInc * yLineCount + (yTextPadding * 2)); //3 - difference with the rounding heights

    xBars += `<rect 
        x="${0 + 10 + i * (barWidth + barSpacing)}" 
        y="${Math.round(chartHeight - yOffset - yTextPadding - POS_NEW * ppxPerNumber)}" 
        width="${barWidth}px" 
        height="${Math.round(POS_NEW * ppxPerNumber)}px" 
        data-positive="${att.POS_NEW}"/>`;

    //adjust spacing for double digit dates
    if (i % 2 == 0) {
      let half = (barWidth + barSpacing) / 2;
      let date = new Date(att.LoadDttm);
      // console.log(`${date.getMonth()+ 1}/${date.getDate()}`);
      let display = `${date.getMonth() + 1}/${date.getDate()}`;
      if (display.toString().length == 2) half += 3;
      if (display.toString().length == 3) half += 6;
      if (display.toString().length == 4) half += 9;

      xAxisLabels += `<text 
        x="${0 + 10 + i * (barWidth + barSpacing) + half}" 
        y="${Math.round(chartHeight - yOffset - yTextPadding) + 16}">
        ${display}
        </text>`;
    }
  }

  if(sma){
    console.log(sma);
  }


  return `
  <div style="display:flex;">
    <div id="fixed-svg">
      <svg style="height:${chartHeight + yLabelMargin}px; width: ${yAxisWidth}px;>
        <title id="title">Brown County Covid Cases</title>
        
        <g class="labels y-labels"">
          ${yAxisValues}
        </g>

        <text x="${20}" y="${chartHeight / 2}" transform="rotate(-90,${20},${chartHeight / 2})" class="label-title">New Cases</text>
        
      </svg>
    </div>
    
    <div id="scrolling-div" style="overflow-x: scroll; overscroll-behavior-x: none; overflow-y:hidden;">

      <svg id="svg-chart" x="${yAxisWidth}" height="${chartHeight + yLabelMargin}px" width="${chartWidth + yAxisWidth}" class="labels x-labels">
        <g>${yAxisLines}</g>
        <g>${xBars}</g>
        <g>${xAxisLabels}</g>
      </svg>

    </div>
  </div>

  <div id="xTitle">
    <span style="display:flex; justify-content:center" class="label-title">Dates</span>
  </div>
  `;
}

function roundToNearesOnes(number) {
  return Math.round(number);
}


function roundToNearestHundredth(number) {
  return Math.round((number) * 100) / 100;
}


function roundToNearestTenth(number) {
  return Math.round((number) * 10) / 10;
}

export { dynamicChart };