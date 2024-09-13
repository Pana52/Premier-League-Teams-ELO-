import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './TeamList.css'; // Assuming you have some styles for team boxes and containers

const TeamGraph = ({ team }) => {
  const [eloData, setEloData] = useState(null); // All ELO data
  const [availableYears, setAvailableYears] = useState([]); // List of available years
  const [selectedYear, setSelectedYear] = useState(null); // Currently selected year
  const graphRef = useRef(null); // Ref for the graph container

  // Fetch the CSV data when the component mounts
  useEffect(() => {
    fetch(`/Team_ELO_Logs/${team}_ELO_Log.csv`)
      .then((response) => response.text())
      .then((data) => {
        const parsedData = d3.csvParse(data);
        const groupedByYear = d3.groups(parsedData, (d) => d.Season_End_Year);
        setEloData(groupedByYear);
        setAvailableYears(groupedByYear.map(([year]) => year)); // Extract unique years
      })
      .catch((error) => console.error('Error loading team data:', error));
  }, [team]);

  // Render graph when a year is selected
  useEffect(() => {
    if (selectedYear && eloData) {
      const dataForYear = eloData.find(([year]) => year === selectedYear)[1];
      renderGraph(dataForYear);
    }
  }, [selectedYear, eloData]);

  // Function to render the graph for the selected year
  const renderGraph = (data) => {
    // Clear the graph container before appending a new one
    d3.select(graphRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 256 - margin.top - margin.bottom;

    const svg = d3
      .select(graphRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Convert week and ELO data to numbers
    data.forEach((d) => {
      d.Week = +d.Week;
      d.ELO = +d.ELO;
    });

    // X-axis for weeks
    const x = d3.scaleLinear().domain([1, d3.max(data, (d) => d.Week)]).range([0, width]);

    // Y-axis for ELO
    const y = d3.scaleLinear().domain([0, 1200]).range([height, 0]);

    // Draw axes
    svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));
    svg.append('g').call(d3.axisLeft(y));

    // Draw line for ELO values over the weeks
    const line = d3
      .line()
      .x((d) => x(d.Week))
      .y((d) => y(d.ELO));

    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', line);
  };

  return (
    <div className="teamContent">
      <div className="logoContainer">
        <img
          src={`/Teams Logos/${team}_Logo.svg`}
          alt={`${team} Logo`}
          className="teamLogo"
        />
      </div>

      {/* Display available years as buttons */}
      <div className="yearButtons">
        {availableYears.length > 0 ? (
          availableYears.map((year) => (
            <button
              key={year}
              className={selectedYear === year ? 'active' : ''}
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </button>
          ))
        ) : (
          <p>Loading years...</p>
        )}
      </div>

      {/* Graph container */}
      {selectedYear && <div className="graphContainer" ref={graphRef}></div>}
    </div>
  );
};

export default TeamGraph;
