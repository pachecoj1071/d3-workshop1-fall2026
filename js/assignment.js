// ============================================================================
// STOCK PRICE VISUALIZATION ASSIGNMENT
// ============================================================================
// Your task: Complete this script to create a multi-line chart showing
// stock prices for Apple (AAPL), Google (GOOG), and Amazon (AMZN), IBM (IBM),
// Microsoft (MSFT), then add ONE vertical line that follows the mouse and a
// tooltip that shows every company's price on that date.
//
// Follow the TODO comments and refer to section5.js (line chart) for guidance.
// The tooltip is NOT covered in the demo: use the documentation links in the
// TOOLTIP section below
// ============================================================================


// ============================================================================
// DATA LOADING
// ============================================================================
// Load CSV files for three stocks in parallel
// Pattern: d3.csv("filename").then(data => ({name: "SYMBOL", values: data}))

let stocks = await Promise.all([
    d3.csv("data/AAPL.csv").then(data => ({ name: "AAPL", values: data })),
    d3.csv("data/GOOG.csv").then(data => ({name: "GOOG", values: data})),
    d3.csv("data/AMZN.csv").then(data => ({name: "AMZN", values: data})),
    d3.csv("data/IBM.csv").then(data => ({name: "IBM", values: data})),
    d3.csv("data/MSFT.csv").then(data => ({name: "MSFT", values: data}))
    // TODO: Load GOOG.csv with name "GOOG"
    // TODO: Load AMZN.csv with name "AMZN"
    // TODO: LOAD IBM.csv with name "IBM"
    // TODO: LOAD MSFT.csv with name "MSFT"
]);

console.log("Loaded stocks:", stocks);


// ============================================================================
// DATA PROCESSING
// ============================================================================
// Convert string values to proper types (dates and numbers)
// Remember: CSV data loads as strings

stocks.forEach(stock => {
    stock.values.forEach(d => {
        // TODO: Convert d.Date from string to Date object
        // Hint: new Date(d.Date)
        d.Date = new Date(d.Date);

        // TODO: Convert d.Close from string to number
        // Hint: Use the + operator like +d.Close
        d.Close = +d.Close;

        // TODO: Convert these additional fields to numbers
        // d.Open, d.High, d.Low, d.Volume
        d.Open = +d.Open;
        d.High = +d.High;
        d.Low = +d.Low;
        d.Volume = + d.Volume;
    });

    // TODO: Sort stock.values by date (oldest to newest)
    stocks.sort((a, b) => {
        const dateA = new Date(Object.values(a).find(val => val?.date)?.date);
        const dateB = new Date(Object.values(b).find(val => val?.date)?.date);

        return d3.ascending(dateA, dateB)
    });
});

console.log("Processed first stock:", stocks[0].values[0]);


// ============================================================================
// CHART DIMENSIONS
// ============================================================================
// Set up the size and margins for the chart
// This is provided - the margin convention is standard D3 practice

const margin = { top: 50, right: 160, bottom: 50, left: 100 };
const width = 1000 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;


// ============================================================================
// SVG SETUP
// ============================================================================
// Create the SVG container and add a group for margins
// This is provided - focus on the scales and drawing instead

const svg = d3.select('#chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);


// ============================================================================
// CREATE SCALES
// ============================================================================
// Scales map data values to pixel positions

// Get all data points from all stocks (we need this for the domains)
const allValues = stocks.flatMap(s => s.values);

// X Scale - Maps dates to horizontal positions
// TODO: Create a time scale using d3.scaleUtc()
// Hint: Look at demo.js Section 5 for the pattern
const x = d3.scaleUtc()
    .domain(d3.extent(stocks[0].values, d => d.Date))
    .range([0, width]);

// Y Scale - Maps prices to vertical positions
// TODO: Create a linear scale using d3.scaleLinear()
const y = d3.scaleLinear()
    .domain([
        // TODO: Get minimum Close price from all stocks
        d3.min(stocks, price => d3.min(price.values, d => d.Close)),
        // TODO: Get maximum Close price from all stocks
        d3.max(stocks, price => d3.max(price.values, d => d.Close))

    ])
    .range([height, 0]);

// Color Scale - Maps stock names to colors
// TODO: Create an ordinal color scale
// Hint: d3.scaleOrdinal(d3.schemeCategory10).domain(mapping goes here)
const color = d3.scaleOrdinal(d3.schemeCategory10).domain(stocks.map(d => d.Name));


// ============================================================================
// ADD AXES
// ============================================================================
// Create and position the x and y axes

// X Axis - Shows years along the bottom
const xAxis = d3.axisBottom(x)
    .ticks(d3.timeYear.every(1))
    .tickFormat(d3.timeFormat('%Y'));

svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis)
    .selectAll('text')
    .style('font-size', '12px');

// Y Axis - Shows prices along the left side
const yAxis = d3.axisLeft(y)
    .ticks(10)
    .tickFormat(d => `$${d.toFixed(2)}`);// TODO: Define Y axis, format ticks to show $ sign

svg.append('g')
    .attr('class', 'y-axis')
    .call(yAxis)
    .selectAll('text')
    .style('font-size', '12px');


// ============================================================================
// DRAW LINES
// ============================================================================
// Create a line for each stock

// TODO: Create a line generator using d3.line()
const line = d3.line()
    .x(d => x(d.Date))
    .y(d => y(d.Close))
    .curve(d3.curveMonotoneX); 

// TODO: Loop through each stock and draw a line
svg.selectAll('.line')
    .data(stocks)
    .join('path')
    .attr('class', 'line')
    .attr('fill', 'none')
    .attr('stroke', d => color(d.name))
    .attr('stroke-width', 2)
    .attr('d', d => line(d.values)); 

// ============================================================================
// TOOLTIP: ONE LINE THAT SHOWS EVERY STOCK'S PRICE
// ============================================================================
// Goal: when the mouse is over the chart, a dashed vertical line follows it,
// and a tooltip lists the closing price of ALL five companies on that date.
//
//      Jun 03, 2015
//      ■ AMZN: $430.20
//      ■ GOOG: $540.10
//      ■ IBM: $170.55
//      ■ AAPL: $127.80
//      ■ MSFT: $46.00
//
// The setup below is provided. You write the overlay's event handlers.

// Documentation for this section (the demo does not cover it):
//   Events (selection.on, d3.pointer):
//     https://d3js.org/d3-selection/events
//     Careful: many tutorials online use d3.event, which is old. This course
//     uses D3 v7, where the listener receives the event as its FIRST argument.
//   Pixel -> Date (scale.invert):
//     https://d3js.org/d3-scale/linear#linear_invert
//   Closest data point (bisector.center, used by the `bisect` helper above):
//     https://d3js.org/d3-array/bisect#bisector_center
//   Tooltip content and position (selection.html, selection.style):
//     https://d3js.org/d3-selection/modifying

const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('pointer-events', 'none')   // so the tooltip never blocks the mouse
    .style('opacity', 0)               // invisible until the mouse is over the chart
    .style('background', 'rgba(20, 23, 26, 0.92)')
    .style('color', '#ffffff')
    .style('padding', '6px 10px')
    .style('border-radius', '4px')
    .style('font-size', '13px')
    .style('line-height', '1.4');

// Helpers
const bisect = d3.bisector(d => d.Date).center;   // index of the data point closest to a Date
const fmtDate = d3.utcFormat('%b %d, %Y');         // formats a Date like "Jun 03, 2015"

// The vertical guide line. Hidden until the mouse is over the chart.
const guide = svg.append('line')
    .attr('class', 'guide')
    .attr('y1', 0)
    .attr('y2', height)
    .attr('stroke', '#888888')
    .attr('stroke-dasharray', '4 4')
    .style('opacity', 0);

// The overlay: a transparent rectangle that covers the whole plot area and catches the mouse. It is appended AFTER the lines so it sits on top of them.
// The three handlers are chained onto it: one statement from svg.append to the final semicolon.
svg.append('rect')
    .attr('class', 'overlay')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'none')
    .attr('pointer-events', 'all') // Provided: an SVG shape with no fill ignores the mouse unless pointer-events is 'all'

    // mouseover: the mouse entered the plot
    .on('mouseover', function () {
        // TODO: show the tooltip (its 'opacity' style)
        tooltip.style('opacity', 0.7);
        // TODO: show the guide line
        guide.style('opacity', 1);
    })

    // mousemove: runs on every mouse move. The event is the FIRST argument.
    .on('mousemove', function (event) {
        //Pointer x inside the plot (a number of pixels)
        const [px] = d3.pointer(event);

        //Pixel -> Date: run the x scale backwards
        const date = x.invert(px);

        //For EACH stock, the data row closest to that date, then sort so the highest price comes first
        const rows = stocks
            .map(s => ({
                name: s.name,
                row: s.values[bisect(s.values, date, 1)] /* TODO: the element of s.values closest to date (use the bisect helper) */
            }))
            .sort((a, b) => d3.descending(a.row.Close, b.row.Close) /* TODO: compare the Close prices, highest first */);

        // Move the guide line to the date of the first row (all stocks share trading days, so any stock's row works)
        guide
            .attr('x1', x(rows[0].row.Date) /* TODO: pixel position of rows[0].row.Date */)
            .attr('x2', x(rows[0].row.Date) /* TODO: the line is vertical, so the same x as x1 */);

        // Fill the tooltip: the date in bold, then one line per company
        tooltip.html(
            `<strong>${fmtDate(rows[0].row.Date)/* TODO: rows[0].row.Date as text (see the fmtDate helper) */}</strong>` +
            rows.map(r =>
                `<br><span style="color:${color(r.name)}">&#9632;</span> ${r.name/* TODO: company name */}: $${r.row.Close.toFixed(2)/* TODO: closing price with 2 decimals */}`
            ).join('')
        );

        // Place the tooltip next to the pointer (page coordinates)
        tooltip
            .style('left', `${event.pageX + 16/* TODO: event.pageX (the pointer's x on the page), plus 16 */}px`)
            .style('top', `${event.pageY - 28/* TODO: event.pageY (the pointer's y on the page), minus 28 */}px`);
    })

    // mouseout: the mouse left the plot
    .on('mouseout', function () {
        // TODO: hide the tooltip and the guide line again
        tooltip.style('opacity', 0);
        guide.style('opacity', 0);
    });

// TODO (BONUS): a dot on each line at the guide line.
//   Create one circle per stock ONCE, with a keyed join (d => d.name), radius 4,
//   filled with color(d.name), hidden to start. In mousemove, set each circle's
//   cx to the guide's x and cy to y(that stock's Close).

// ============================================================================
// ADD LABELS
// ============================================================================
// Add title and axis labels to make the chart readable

// Chart Title
// TODO: Add a text element for the title
svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', width / 2/* TODO: center the title */)
    .attr('y', -10 /* TODO: put the title above the chart */)
    .attr('text-anchor', 'middle')
    .style('font-size', '18px')
    .style('font-weight', 'bold')
    .text("Stock prices of 5 companies over time" /* TODO: add your title */);

// X Axis Label
// TODO: Add a label below the x-axis
svg.append('text')
    .attr('class', 'x-axis-label')
    .attr('x', width / 2/* TODO: center the label */)
    .attr('y', height + 50 /* TODO: put the label below x-xis */)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .text("Time" /* TODO: add axis label */);

// Y Axis Label
// TODO: Add a label to the left of the y-axis (rotated)
svg.append('text')
    .attr('class', 'y-axis-label')
    .attr('transform', 'rotate(-90)' /* TODO: 'rotate(-90)' */)
    .attr('x', -height/2 /* TODO: center the label */)
    .attr('y', -80 /* TODO: put the label to the left of y-axis */)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .text("Closing Price (USD)"/* TODO: add axis label */);


// ============================================================================
// ADD LEGEND
// ============================================================================
// Create a legend showing which color represents which stock

const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width + 20}, 0)`);

// TODO: For each stock, create a legend entry
stocks.forEach((stock, i) => {
    const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

    // TODO: Add a colored line showing the stock's color
    legendRow.append('line')
        .attr('x1', 15)
        .attr('y1', 10)
        .attr('x2', 40)
        .attr('y2', 10)
        .attr('stroke', color(stock.name))
        .attr('stroke-width', 2);

    // TODO: Add text label with the stock name
    legendRow.append('text')
        .attr('x', 45/* TODO: define x-coordinate of the text label starting point */)
        .attr('y', 10/* TODO: define y-coordinate of the text label starting point */)
        .attr('text-anchor', 'start')
        .style('font-size', '12px')
        .text(stock.name/* TODO: add stock name */);
});