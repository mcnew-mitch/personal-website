
const socialMedia = d3.csv("socialMedia.csv");

socialMedia.then(function(data) {
    // 1. Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // 2. Define the dimensions and margins for the SVG
    const margin = {top: 20, right: 30, bottom: 50, left: 60},
          width = 600 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#boxplot-container") 
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes
    const ageGroups = [...new Set(data.map(d => d.AgeGroup))].sort();
    const maxLikes = d3.max(data, d => d.Likes);

    const xScale = d3.scaleBand()
      .domain(ageGroups)
      .range([0, width])
      .paddingInner(0.1)
      .paddingOuter(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, maxLikes])
      .range([height, 0]);

    // Add scales (Axes)
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append("g")
      .call(d3.axisLeft(yScale));

    // Add x-axis label
    svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 5)
      .text("Age Group");

    // Add y-axis label
    svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "middle")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .attr("transform", "rotate(-90)")
      .text("Number of Likes");

    // 3. Rollup function to calculate boxplot metrics
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values); 
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5); 
        const q3 = d3.quantile(values, 0.75); 
        const max = d3.max(values); 
        return {min, q1, median, q3, max};
    };

    
    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.AgeGroup);

    quantilesByGroups.forEach((quantiles, AgeGroup) => {
        const x = xScale(AgeGroup);
        const boxWidth = xScale.bandwidth();


        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(quantiles.min))
            .attr("y2", yScale(quantiles.max))
            .attr("stroke", "black")
            .attr("stroke-width", 1);
        
     
        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(quantiles.q3)) 
            .attr("height", yScale(quantiles.q1) - yScale(quantiles.q3))
            .attr("width", boxWidth)
            .attr("stroke", "black")
            .style("fill", "#69b3a2")
            .attr("stroke-width", 1);

       
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quantiles.median))
            .attr("y2", yScale(quantiles.median))
            .attr("stroke", "black")
            .attr("stroke-width", 3);
        
    });
});

// part 2.2


const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    // 1. Convert string values to numbers
    data.forEach(function(d) {
        d.AvgLikes = +d.AvgLikes;
    });

    // Define the dimensions and margins for the SVG
    const margin = {top: 20, right: 150, bottom: 50, left: 60}, 
          width = 800 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#bar-chart-container")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define the domains for scales
    const platforms = [...new Set(data.map(d => d.Platform))];
    const postTypes = [...new Set(data.map(d => d.PostType))];
    const maxAvgLikes = d3.max(data, d => d.AvgLikes);

    // 2. Define four scales
    const x0 = d3.scaleBand()
      .domain(platforms)
      .range([0, width])
      .paddingInner(0.1);

    const x1 = d3.scaleBand()
      .domain(postTypes)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3.scaleLinear()
      .domain([0, maxAvgLikes * 1.05])
      .range([height, 0]);

    const color = d3.scaleOrdinal()
      .domain(postTypes)
      .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);    
         
    // 3. Add scales x0 and y (Axes and Labels)
    // X-axis (Platform)
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0));

    // Y-axis (Average Likes)
    svg.append("g")
      .call(d3.axisLeft(y).ticks(5));

    // Add x-axis label
    svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 5)
      .text("Platform");

    // Add y-axis label
    svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "middle")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .attr("transform", "rotate(-90)")
      .text("Average Number of Likes");


    // 4. Group container for bars and Draw bars
    const barGroups = svg.selectAll("bar")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${x0(d.Platform)},0)`); 

    barGroups.append("rect")
      .attr("x", d => x1(d.PostType))
      .attr("y", d => y(d.AvgLikes))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - y(d.AvgLikes))
      .attr("fill", d => color(d.PostType));

    // 5. Add the legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 20}, ${margin.top})`); 

    const types = [...new Set(data.map(d => d.PostType))];
 
    types.forEach((type, i) => {
      
      const legendGroup = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      // Add small colored square/rect bar
      legendGroup.append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", 10)
          .attr("height", 10)
          .style("fill", color(type));

      // Add the text information for the legend. 
      legendGroup.append("text")
          .attr("x", 20)
          .attr("y", 9) 
          .text(type)
          .attr("alignment-baseline", "middle");
    });

});


// PART 2.3: Line plot (Avg. Likes Over Time)

const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    // 1. Convert string values to numbers and parse dates.
    const parseDate = d3.timeParse("%Y-%m-%d"); 
    
    // Sort data by date before processing for correct line plot drawing
    data.sort((a, b) => parseDate(a.Date) - parseDate(b.Date));

    data.forEach(function(d) {
        d.Date = parseDate(d.Date);
        d.AvgLikes = +d.AvgLikes;
    });

    // Define the dimensions and margins for the SVG
    const margin = {top: 20, right: 30, bottom: 60, left: 60}, 
          width = 600 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#line-chart-container")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.Date))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.AvgLikes) * 1.1])
      .range([height, 0]);

    // Draw the axis, with rotated text in the x-axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%m/%d"))) 
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-25)"); 

    // Y-Axis
    svg.append("g")
      .call(d3.axisLeft(yScale));

    // Add x-axis label
    svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 5)
      .text("Date (Month/Day)");

    // Add y-axis label
    svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "middle")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .attr("transform", "rotate(-90)")
      .text("Average Number of Likes");


    // 2. Define and draw the line and path.
    const line = d3.line()
      .x(d => xScale(d.Date))
      .y(d => yScale(d.AvgLikes))
      .curve(d3.curveNatural);

    svg.append("path")
      .datum(data) 
      .attr("fill", "none")
      .attr("stroke", "steelblue") 
      .attr("stroke-width", 2)
      .attr("d", line);
      
    // Add circles for data points
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.Date))
        .attr("cy", d => yScale(d.AvgLikes))
        .attr("r", 4) 
        .attr("fill", "steelblue");
});