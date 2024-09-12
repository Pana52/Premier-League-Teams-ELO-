import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import './ELOTableMain.css'; // Add a CSS file for scrollable table styling

const ELOTableMain = () => {
  const [eloData, setEloData] = useState([]); // State to store CSV data
  const [selectedSeason, setSelectedSeason] = useState(null); // State for the selected season

  // Fetch and parse CSV data on component mount
  useEffect(() => {
    fetch('/ELO_Ratings_Log.csv') // Ensure this path is correct
      .then((response) => response.text())
      .then((data) => {
        const parsedData = d3.csvParse(data, (d) => ({
          ...d,
          // Convert ELO values to numbers and round them
          Home_ELO_New: Math.round(+d.Home_ELO_New),
          Home_ELO_Change: Math.round(+d.Home_ELO_Change),
          Away_ELO_New: Math.round(+d.Away_ELO_New),
          Away_ELO_Change: Math.round(+d.Away_ELO_Change),
          HomeGoals: +d.HomeGoals, // Ensure goals are treated as numbers
          AwayGoals: +d.AwayGoals,
        }));
        setEloData(parsedData);
      })
      .catch((error) => console.error('Error loading ELO data:', error));
  }, []);

  // Group data by season and game week
  const seasons = d3.group(eloData, (d) => d.Season_End_Year);

  const handleSeasonClick = (season) => {
    setSelectedSeason(selectedSeason === season ? null : season); // Toggle season display
  };

  return (
    <div className="elo-table-container">
      <h2>Premier League ELO Ratings - Full Table</h2>
      <div className="table-wrapper">
        {Array.from(seasons.keys()).map((season) => (
          <div key={season} className="season-section">
            <button className="season-button" onClick={() => handleSeasonClick(season)}>
              {season}
            </button>
            {selectedSeason === season && (
              <div className="matches-by-week">
                {Array.from(d3.group(seasons.get(season), (d) => d.Week).entries()).map(
                  ([week, matches]) => (
                    <div key={week} className="week-section">
                      <h3>Game Week {week}</h3>
                      <div className="matches">
                        {matches.map((match, index) => (
                          <MatchRow key={index} match={match} />
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// MatchRow component to display individual match data
const MatchRow = ({ match }) => {
  const getColorForEloChange = (change) => {
    if (change > 0) return 'green';
    if (change < 0) return 'red';
    return 'yellow';
  };

  const getColorForGoals = (homeGoals, awayGoals) => {
    if (homeGoals > awayGoals) return 'green';
    if (homeGoals < awayGoals) return 'red';
    return 'yellow';
  };

  return (
    <div className="match-row">
      {/* Home Team ELO Change */}
      <div className={`elo-change ${getColorForEloChange(match.Home_ELO_Change)}`}>
        {match.Home_ELO_Change}
      </div>

      {/* Home Team ELO */}
      <div className="elo-value">{match.Home_ELO_New}</div>

      {/* Home Team Logo and Name */}
      <div className="team-info">
        <img src={`/Teams Logos/${match.Home_Team}_Logo.svg`} alt={`${match.Home_Team} Logo`} />
        <span>{match.Home_Team}</span>
      </div>

      {/* Home Team Goals */}
      <div className={`goals ${getColorForGoals(match.HomeGoals, match.AwayGoals)}`}>
        {match.HomeGoals}
      </div>

      {/* Match Date */}
      <div className="match-date">{match.Date}</div>

      {/* Away Team Goals */}
      <div className={`goals ${getColorForGoals(match.AwayGoals, match.HomeGoals)}`}>
        {match.AwayGoals}
      </div>

      {/* Away Team Logo and Name */}
      <div className="team-info away">
        <span>{match.Away_Team}</span>
        <img src={`/Teams Logos/${match.Away_Team}_Logo.svg`} alt={`${match.Away_Team} Logo`} />
      </div>

      {/* Away Team ELO */}
      <div className="elo-value">{match.Away_ELO_New}</div>

      {/* Away Team ELO Change */}
      <div className={`elo-change ${getColorForEloChange(match.Away_ELO_Change)}`}>
        {match.Away_ELO_Change}
      </div>
    </div>
  );
};

export default ELOTableMain;
