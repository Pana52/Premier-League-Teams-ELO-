document.addEventListener("DOMContentLoaded", function() {
    const eloTableContainer = document.getElementById("eloTableContainer");

    // Fetch and display the ELO ratings table in the ELO section
    /*===============================================================================================*/
    fetch('ELO_Ratings_Log.csv') // Replace with your actual CSV file path
        .then(response => response.text())
        .then(data => {
            const rows = data.split("\n").map(row => row.split(","));
            if (rows.length <= 1) {
                throw new Error("No data found");
            }

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

            // Display the table in the eloTableContainer section
            eloTableContainer.innerHTML = table;
        })
        .catch(error => {
            console.error("Error loading ELO data:", error);
            eloTableContainer.innerHTML = `<p>Error loading ELO data. Please try again later.</p>`;
        });
    /*===============================================================================================*/
});
