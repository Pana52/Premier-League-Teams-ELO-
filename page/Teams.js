document.addEventListener("DOMContentLoaded", function() {
    // Constants
    /*===============================================================================================*/
    const teamList = document.getElementById("teamList");
    const teamSearch = document.getElementById("teamSearch");
    const resetButton = document.getElementById("resetButton");
    // List of teams
    const teamNames = ["Arsenal", "Aston Villa", "Barnsley", "Birmingham City", "Blackburn", "Blackpool", "Bolton", "Bournemouth", "Bradford City", "Brentford", "Brighton", "Burnley", "Cardiff City", "Charlton Ath", "Chelsea", "Coventry City", "Crystal Palace", "Derby County", "Everton", "Fulham", "Huddersfield", "Hull City", "Ipswich Town", "Leeds United", "Leicester City", "Liverpool", "Manchester City", "Manchester Utd", "Middlesbrough", "Newcastle Utd", "Norwich City", "Nott'ham Forest", "Oldham Athletic", "Portsmouth", "QPR", "Reading", "Sheffield Utd", "Sheffield Weds", "Southampton", "Stoke City", "Sunderland", "Swansea City", "Swindon Town", "Tottenham", "Watford", "West Brom", "West Ham", "Wigan Athletic", "Wimbledon", "Wolves"]; // Replace with your actual team names
    /*===============================================================================================*/

    // Function to populate the team list
    /*===============================================================================================*/
    function populateTeamList(teams) {
        teamList.innerHTML = ""; // Clear existing team boxes
        teams.forEach(team => {
            let div = document.createElement("div");
            div.classList.add("teamBox");
            div.innerHTML = `<h3>${team}</h3>`;
            div.addEventListener("click", () => toggleTeamData(team, div));
            teamList.appendChild(div);
        });
    }
    /*===============================================================================================*/

    /*===============================================================================================*/
    // Initial population of the team list
    populateTeamList(teamNames);

    // Filter teams based on search input
    teamSearch.addEventListener("input", function() {
        const searchTerm = teamSearch.value.toLowerCase();
        const filteredTeams = teamNames.filter(team => team.toLowerCase().includes(searchTerm));
        populateTeamList(filteredTeams);
    });

    // Reset the team list to show all teams
    resetButton.addEventListener("click", function() {
        teamSearch.value = ""; // Clear the search input
        populateTeamList(teamNames); // Repopulate with all teams
    });
    /*===============================================================================================*/

    /*===============================================================================================*/
    function toggleTeamData(team, teamBox) {
        let existingContentDiv = teamBox.nextElementSibling;
        if (existingContentDiv && existingContentDiv.classList.contains("teamContent")) {
            existingContentDiv.remove();
            return;
        }
    
        let contentDiv = document.createElement("div");
        contentDiv.classList.add("teamContent");
    
        // Create the logo container
        const logoDiv = document.createElement("div");
        logoDiv.classList.add("logoContainer");
    
        // Create the image element for the logo
        const logoImg = document.createElement("img");
        logoImg.src = `Teams Logos/${team}_Logo.svg`; // Update the path to your logo folder
        logoImg.alt = `${team} Logo`;
    
        // Append the logo to the logo container
        logoDiv.appendChild(logoImg);
    
        // Create the graph container
        const graphDiv = document.createElement("div");
        graphDiv.classList.add("graphContainer");
    
        // Append the logo and graph containers to the contentDiv
        contentDiv.appendChild(logoDiv);
        contentDiv.appendChild(graphDiv);
    
        fetch(`Team_ELO_Logs/${team}_ELO_Log.csv`)
            .then(response => response.text())
            .then(data => {
                let rows = d3.csvParse(data);
    
                const margin = { top: 20, right: 30, bottom: 30, left: 50 },
                    width = graphDiv.clientWidth - margin.left - margin.right, // Full width of the graph container
                    height = 256 - margin.top - margin.bottom; // Fixed height to match the logo height
    
                const svg = d3.select(graphDiv).append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);
    
                // Convert "Season_End_Year" and "Week" to numeric values
                rows.forEach(d => {
                    d.Season_End_Year = +d.Season_End_Year;
                    d.Week = +d.Week;
                    d.ELO = +d.ELO;
                });
    
                // Identify gaps in the years
                const allYears = d3.range(
                    d3.min(rows, d => d.Season_End_Year),
                    d3.max(rows, d => d.Season_End_Year) + 1
                );
    
                let relegationPeriods = [];
    
                // Insert rows with ELO = 0 for missing years and track relegation periods
                allYears.forEach(year => {
                    const existing = rows.some(d => d.Season_End_Year === year);
                    if (!existing) {
                        rows.push({ Season_End_Year: year, Week: 1, ELO: 0 });
                        relegationPeriods.push({ Season_End_Year: year, ELO: 0 });
                    }
                });
    
                // Sort the rows by Year and Week
                rows.sort((a, b) => (a.Season_End_Year - b.Season_End_Year) || (a.Week - b.Week));
    
                // Create a scale for the X-axis based on "Season_End_Year" and "Week"
                const x = d3.scaleLinear()
                    .domain([
                        d3.min(rows, d => d.Season_End_Year + d.Week / 100), // Small fraction to separate weeks within the same season
                        d3.max(rows, d => d.Season_End_Year + d.Week / 100)
                    ])
                    .range([0, width]);
    
                // Set Y-axis range from 0 to 2000
                const y = d3.scaleLinear()
                    .domain([0, 2000])
                    .range([height, 0]);
    
                // X-axis
                const xAxis = svg.append("g")
                    .attr("transform", `translate(0,${height})`)
                    .call(d3.axisBottom(x)
                        .tickFormat(d => Math.floor(d)) // Show only the year on the axis
                    );
    
                // Y-axis
                svg.append("g")
                    .call(d3.axisLeft(y));
    
                // Area generator for relegation periods
                const area = d3.area()
                    .x(d => x(d.Season_End_Year + d.Week / 100))
                    .y0(height) // Bottom of the area (ELO = 0)
                    .y1(y(0)); // Top of the area (ELO = 0)
    
                // Draw relegation periods
                svg.append("path")
                    .datum(relegationPeriods)
                    .attr("fill", "red")
                    .attr("opacity", 0.5)
                    .attr("d", area);
    
                // Line path generator with defined function
                const line = d3.line()
                    .defined(d => d.ELO > 0) // Only connect data points with ELO > 0
                    .x(d => x(d.Season_End_Year + d.Week / 100))
                    .y(d => y(d.ELO));
    
                const linePath = svg.append("path")
                    .datum(rows)
                    .attr("fill", "none")
                    .attr("stroke", "steelblue")
                    .attr("stroke-width", 1.5)
                    .attr("class", "line")
                    .attr("d", line);
    
                // Focus group for hover effects (without vertical line)
                const focus = svg.append("g")
                    .attr("class", "focus")
                    .style("display", "none");
    
                focus.append("circle")
                    .attr("r", 5)
                    .attr("fill", "steelblue");
    
                focus.append("text")
                    .attr("class", "hover-text")
                    .attr("x", 15)
                    .attr("dy", ".31em");
    
                svg.append("rect")
                    .attr("class", "overlay")
                    .attr("width", width)
                    .attr("height", height)
                    .style("fill", "none")
                    .style("pointer-events", "all")
                    .on("mouseover", () => focus.style("display", null))
                    .on("mouseout", () => focus.style("display", "none"))
                    .on("mousemove", mousemove);
    
                function mousemove(event) {
                    const bisect = d3.bisector(d => d.Season_End_Year + d.Week / 100).left;
                    const x0 = x.invert(d3.pointer(event, this)[0]);
                    const i = bisect(rows, x0, 1);
                    const d0 = rows[i - 1];
                    const d1 = rows[i];
                    const d = x0 - (d0.Season_End_Year + d0.Week / 100) > (d1.Season_End_Year + d1.Week / 100) - x0 ? d1 : d0;
                    
                    // Update the position of the focus group
                    focus.attr("transform", `translate(${x(d.Season_End_Year + d.Week / 100)},${y(d.ELO)})`);
                    
                    // Display both X and Y values
                    focus.select(".hover-text").text(`Year: ${d.Season_End_Year}, Week: ${d.Week}, ELO: ${d.ELO.toFixed(2)}`)
                        .attr("x", x(d.Season_End_Year + d.Week / 100) > width / 2 ? -150 : 15); // Adjust position based on hover point
                }
    
            })
            .catch(error => {
                console.error("Error loading team data:", error);
                contentDiv.innerHTML = `<p>Error loading data for ${team}. Please try again later.</p>`;
            });
    
        teamBox.parentNode.insertBefore(contentDiv, teamBox.nextSibling);
    }    
    /*===============================================================================================*/
});
