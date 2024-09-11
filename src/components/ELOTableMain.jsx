import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import './ELOTableMain.css'; // Add a CSS file for scrollable table styling

const ELOTableMain = () => {
  const [eloData, setEloData] = useState([]); // State to store CSV data

  // Fetch and parse CSV data on component mount
  useEffect(() => {
    fetch('/ELO_Ratings_Log.csv') // Update with the correct path to your CSV file
      .then((response) => response.text())
      .then((data) => {
        const parsedData = d3.csvParse(data);
        setEloData(parsedData);
      })
      .catch((error) => console.error('Error loading ELO data:', error));
  }, []);

  return (
    <div className="elo-table-container">
      <h2>Premier League ELO Ratings - Full Table</h2>
      <div className="table-wrapper">
        <table className="elo-table">
          <thead>
            <tr>
              {/* Replace these headers based on your actual CSV headers */}
              <th>Date</th>
              <th>Season_End_Year</th>
              <th>Week</th>
              <th>ELO</th>
            </tr>
          </thead>
          <tbody>
            {eloData.length > 0 ? (
              eloData.map((row, index) => (
                <tr key={index}>
                  <td>{row.Date}</td>
                  <td>{row.Season_End_Year}</td>
                  <td>{row.Week}</td>
                  <td>{row.ELO}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">Loading data...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ELOTableMain;
