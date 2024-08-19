document.addEventListener("DOMContentLoaded", function() {
    const teamList = document.getElementById("teamList");
    const teamSearch = document.getElementById("teamSearch");
    const resetButton = document.getElementById("resetButton");

    // List of teams
    const teamNames = ["Arsenal", "Aston Villa", "Barnsley", "Birmingham City", "Blackburn", "Blackpool", "Bolton", "Bournemouth", "Bradford City", "Brentford City", "Brighton", "Burnley", "Cardiff City", "Charlton Ath", "Chelsea", "Coventry City", "Crystal Palace", "Derby County", "Everton", "Fulham", "Huddersfield", "Hull City", "Ipswich Town", "Leeds United", "Leicester City", "Liverpool", "Manchester City", "Manchester Utd", "Middlesbrough", "Newcastle Utd", "Norwich City", "Nott'ham Forest", "Oldham Athletic", "Portsmouth", "QPR", "Reading", "Sheffield Utd", "Sheffield Weds", "Southampton", "Stoke City", "Sunderland", "Swansea City", "Swindon Town", "Tottenham", "Watford", "West Brom", "West Ham", "Wigan Athletic", "Wimbledon", "Wolves"]; // Replace with your actual team names

    // Function to populate the team list
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

    function toggleTeamData(team, teamBox) {
        // Check if the content is already displayed
        let existingContentDiv = teamBox.nextElementSibling;
        if (existingContentDiv && existingContentDiv.classList.contains("teamContent")) {
            existingContentDiv.remove(); // Remove the existing content if already displayed
            return;
        }

        // Create a new content div
        let contentDiv = document.createElement("div");
        contentDiv.classList.add("teamContent");

        // Fetch and display the team's ELO log
        fetch(`Team_ELO_Logs/${team}_ELO_Log.csv`)
            .then(response => response.text())
            .then(data => {
                // Parse CSV data into rows and columns
                const rows = data.split("\n").map(row => row.split(","));
    
                // Create an HTML table
                let table = "<table>";
                table += "<thead><tr>";
                // Assuming the first row contains headers
                rows[0].forEach(header => {
                    table += `<th>${header.trim()}</th>`;
                });
                table += "</tr></thead><tbody>";
    
                // Add data rows
                rows.slice(1).forEach(row => {
                    table += "<tr>";
                    row.forEach(cell => {
                        table += `<td>${cell.trim()}</td>`;
                    });
                    table += "</tr>";
                });
    
                table += "</tbody></table>";
    
                // Display the table in the contentDiv section
                contentDiv.innerHTML = table;
            })
            .catch(error => {
                console.error("Error loading team data:", error);
                contentDiv.innerHTML = `<p>Error loading data for ${team}. Please try again later.</p>`;
            });

        // Insert the new content div right after the team box
        teamBox.parentNode.insertBefore(contentDiv, teamBox.nextSibling);
    }
});
