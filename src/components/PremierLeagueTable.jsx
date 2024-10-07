import React, { useState, useEffect } from 'react';
import './PremierLeagueTable.css';

const PremierLeagueTable = ({ season }) => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    fetch(`/api/premier-league-table?season=${season}`)
      .then((response) => response.json())
      .then((data) => {
        setTableData(data);
      })
      .catch((error) => console.error('Error loading Premier League table data:', error));
  }, [season]);

  return (
    <div className="premier-league-table">
      <h3>Premier League Table - Season {season}</h3>
      {tableData.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Pos</th>
              <th>Club</th>
              <th>Played</th>
              <th>Won</th>
              <th>Drawn</th>
              <th>Lost</th>
              <th>GF</th>
              <th>GA</th>
              <th>GD</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((team) => (
              <tr key={team._id}>
                <td>{team.Position}</td>
                <td>{team.Club}</td>
                <td>{team.Played}</td>
                <td>{team.Won}</td>
                <td>{team.Drawn}</td>
                <td>{team.Lost}</td>
                <td>{team.GF}</td>
                <td>{team.GA}</td>
                <td>{team.GD}</td>
                <td>{team.Points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No table data available for this season</p>
      )}
    </div>
  );
};

export default PremierLeagueTable;
