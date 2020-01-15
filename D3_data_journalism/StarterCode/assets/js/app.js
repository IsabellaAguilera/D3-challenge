// @TODO: YOUR CODE HERE!

var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("body")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
  }

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
        d3.max(data, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
  
  }

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return xAxis;
  }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  } 

  function renderCLabels(cLabelsGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    cLabelsGroup.transition()
        .duration(1500)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));
    
    return cLabelsGroup
  }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  
    if (chosenXAxis === "poverty") {
      var xlabel = "In Poverty (%): ";
    }
    else if (chosenXAxis === "age") {
        var xlabel = "Age (Median): ";
    }
    else {
      var xlabel = "Household Income (Median): $";
    };  

    if (chosenYAxis === "healthcare") {
      var ylabel = "Lacks Healthcare (%): ";
    }
    else if (chosenXAxis === "obesity") {
        var ylabel = "Obese (%): ";
    }
    else {
      var ylabel = "Smokes (%): ";
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state} (${d.abbr})<br>${ylabel}${d[chosenYAxis]}<br>${xlabel}${d[chosenXAxis]}`);
      });
  
    circlesGroup.call(toolTip);

      // mouseover event
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
        })

      // mouseout event
        .on("mouseout", function(data, index) {
        toolTip.hide(data);
        });
  
    return circlesGroup;
  }


  d3.csv("assets/data/data.csv").then(function(trendsData, err) {
    if (err) throw err;

    trendsData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
      });
  
    // xLinearScale function above csv import
    var xLinearScale = xScale(trendsData, chosenXAxis);

    // yLinearScale function above csv import
    var yLinearScale = yScale(trendsData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .attr("transform", `translate(${width}, 0)`)
    .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
     .data(trendsData)
     .enter()
     .append("circle")
     .attr("cx", d => xLinearScale(d[chosenXAxis]))
     .attr("cy", d => yLinearScale(d[chosenYAxis]))
     .attr("r", "10")
     .attr("fill", "blue")
     .attr("opacity", ".5")
     .on("mouseout", function(data,index) {
         toolTip.hide(data);
     });
    
    // create circle labels
    var cLabelsGroup = chartGroup.selectAll(".text")
     .data(trendsData)
     .enter()
     .append("text")
     .text( d => d.abbr)
     .attr("text-anchor", "middle")
     .attr("alignment-baseline", "middle")
     .attr("font-size","12px")
     .attr("font-weight", "bold")
     .attr("fill","white")
     .attr("x", d => xLinearScale(d[chosenXAxis]))  
     .attr("y", d => yLinearScale(d[chosenYAxis]));

    // x labels

    var xLabelsGroup = chartGroup.append("g")
     .attr("transform", `translate(${width/2}, ${height + 20})`);
    
    var povertyLabel = xLabelsGroup.append("text")
     .text("In Poverty (%)")
     .attr("x", 0)
     .attr("y", 15)
     .attr("value", "poverty")
     .classed("active", true);
    
    var ageLabel = xLabelsGroup.append("text")
     .text("Age (Median)")
     .attr("x", 0)
     .attr("y", 35)
     .attr("value", "age")
     .classed("inactive", true);
    
    var incomeLabel = xLabelsGroup.append("text")
     .text("Household Income (Median)")
     .attr("x", 0)
     .attr("y", 55)
     .attr("value", "income")
     .classed("inactive", true);
    
    // y labels
    
    var yLabelsGroup = chartGroup.append("g")
     .attr("transform", "rotate(-90)");
    
    var healthcareLabel = yLabelsGroup.append("text")
     .text("Lacks Healthcare(%)")
     .attr("x", 0 - (height/2))
     .attr("y", 0 - (margin.left/3))
     .attr("value", "healthcare")
     .classed("active", true);

    var obesityLabel = yLabelsGroup.append("text")
     .text("Obese (%)")
     .attr("x", 0 - (height/2))
     .attr("y", -20 - (margin.left/3))
     .attr("value", "obesity")
     .classed("inactive", true);

    var smokesLabel = yLabelsGroup.append("text")
     .text("Smokes (%)")
     .attr("x", 0 - (height/2))
     .attr("y", -40 - (margin.left/3))
     .attr("value","smokes")
     .classed("inactive", true);
    
    // update tooltip 
    var circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

    xLabelsGroup.selectAll("text")
     .on("click", function() {

        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

            chosenXAxis = value;

            console.log(chosenXAxis);

            xLinearScale = xScale(trendsData, chosenXAxis);

            xAxis = renderXAxes(xLinearScale, xAxis);

            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            circlesGroup = updateToolTip(circlesGroup, chosenYAxis, chosenYAxis);

            cLabelsGroup = renderCLabels(cLabelsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            if (chosenYAxis === "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenXAxis === "age") {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
     });
    
    yLabelsGroup.selectAll("text")
     .on("click", function() {
        
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

            chosenYAxis = value;

            console.log(chosenYAxis);

            yLinearScale = yScale(trendsData, chosenYAxis);

            yAxis = renderYAxes(yLinearScale, yAxis);

            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            circlesGroup = updateToolTip(circlesGroup, chosenYAxis);

            cLabelsGroup = renderCLabels(cLabelsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            if (chosenYAxis === "smokes") {
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenYAxis === "obesity") {
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
     });

  }).catch(function(error) {
      console.log(error);
  });