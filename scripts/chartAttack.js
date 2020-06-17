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
function dynamicChart(params) {
  let { days, max, features, windowHeight, contextWrapper } = params;

  // const svgWrapper = document.querySelector('#svg-wrapper');

  let yLabelMargin = 20;
  //285 or 722
  let chartHeight = windowHeight - contextWrapper.clientHeight - yLabelMargin;
  // svgWrapper.setAttribute('style', `width: 100%`); //? needed?

  let xAxisLabels = ''; //date
  let xBars = '';
  const barWidth = 9;
  const barSpacing = 9;

  let yAxisValues = ''; //count
  let yAxisLines = ''; //appended by for loop
  let xIndent = 50;


  //table id="county"
  const width = (days * (barWidth + barSpacing));

  let l = {
    yLines: 20, //number of y ticks (makes x line) - rounded up (+1) 
    yTextPadding: 10,
  };
  let p = {
    yLines: 20,
  };

  // console.log(`screen width: ${screen.width}, height: ${screen.height}, pixelRatio: ${window.devicePixelRatio}........`);

  // max = 500;
  let yMaxValue = Math.ceil(max / l.yLines) * l.yLines; //round this up
  let yLineInc = (chartHeight - l.yTextPadding * 2) / l.yLines; //pixel increment per line
  let yNumbInc = yMaxValue / l.yLines; // number increment per line
  let ppxPerNumber = roundToNearestHundredth(yLineInc / yNumbInc); //easy on the rounding here - can break if less than .00
  // console.log(`yLineInc: ${yLineInc} (px spacing per line); yNumbInc: ${yNumbInc}; ppxPerNumber: ${ppxPerNumber}`); //line inc


  // console.log(`max: ${max}, yMaxValue: ${yMaxValue}, chartHeight: ${chartHeight}px;`);
  // console.log(`w.innerHeight: ${window.innerHeight}, contextWrapper.clientHeight: ${contextWrapper.clientHeight} = chartHeight: ${chartHeight}`);

  let count = 0;
  //yAxis lines and values
  for (let i = l.yTextPadding; i < chartHeight; i += yLineInc) {
    const yNumberCount = yMaxValue - (count * yNumbInc);
    // console.log(`y location: ${i}`); console.count()
    //lines (by i == pixel location for each line)
    yAxisLines += `<line class="xAxis" x1="${0}" y1="${i}" x2="${width}" y2="${i}"></line>`;

    //numbers (by yMax)
    yAxisValues += `<text x="${xIndent - 2}" y="${i + 5}">${yNumberCount}</text>`;
    count++;
  }


  // console.log(features);
  //horizontal bars
  for (let i = 0; i < features.length; i++) {
    const att = features[i].attributes;
    const yOffset = chartHeight - (yLineInc * l.yLines + (l.yTextPadding * 2)); //3 - difference with the rounding heights

    xBars += `<rect 
        x="${0 + 10 + i * (barWidth + barSpacing)}" 
        y="${Math.round(chartHeight - yOffset - l.yTextPadding - att.POS_NEW * ppxPerNumber)}" 
        width="${barWidth}px" 
        height="${Math.round(att.POS_NEW * ppxPerNumber)}px" 
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
        y="${Math.round(chartHeight - yOffset - l.yTextPadding) + 16}">
        ${display}
        </text>`;
    }
  }


  return `
  <div style="display:flex;">
    <div id="fixed-svg">
      <svg style="height:${chartHeight + yLabelMargin}px; width: ${xIndent}px; background-color:"inherit";">
        <title id="title">Brown County Covid Cases</title>
        
        <g class="labels y-labels"">
          ${yAxisValues}
        </g>

        <text x="${20}" y="${chartHeight / 2}" transform="rotate(-90,${20},${chartHeight / 2})" class="label-title">New Cases</text>
        
      </svg>
    </div>
    
    <div id="scrolling-svg" style="overflow-x: scroll; overscroll-behavior-x: none; overflow-y:hidden;">

      <svg x="${xIndent}" height="${chartHeight + yLabelMargin}px" width="${width + xIndent}" class="labels x-labels">
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


  // console.log(`window innerWidth:${window.innerWidth}, innerHeight:${window.innerHeight}`);
  // console.dir(contextWrapper);  
  // console.log(`contextWrapper clientWidth: ${contextWrapper.clientWidth}, clientHeight: ${contextWrapper.clientHeight}`);

  // console.log(features);
  //${window.innerWidth}px
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