import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './ELOTableMain.css';
import PremierLeagueTable from './PremierLeagueTable';

const ELOTableMain = () => {
  const [eloData, setEloData] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(null); // Track the focused button
  const conveyorRef = useRef(null); // Ref for the conveyor belt
  const isDragging = useRef(false); // Track whether dragging is happening
  const startX = useRef(0); // Store the starting X position of the mouse when dragging starts
  const scrollLeft = useRef(0); // Store the initial scroll position when dragging starts

  // Track the selected week
  const [selectedWeek, setSelectedWeek] = useState(null);

  // Fetch the ELO data from the API
  useEffect(() => {
    fetch('/api/elo-data')
      .then((response) => response.json())
      .then((data) => {
        const parsedData = data.map((d) => ({
          ...d,
          Home_ELO_New: Math.round(d.Home_ELO_New),
          Home_ELO_Change: Math.round(d.Home_ELO_Change),
          Away_ELO_New: Math.round(d.Away_ELO_New),
          Away_ELO_Change: Math.round(d.Away_ELO_Change),
          HomeGoals: +d.HomeGoals,
          AwayGoals: +d.AwayGoals,
        }));
        setEloData(parsedData);
      })
      .catch((error) => console.error('Error loading ELO data:', error));
  }, []);

  // Group the data by season
  const seasons = d3.group(eloData, (d) => d.Season_End_Year);
  
  // Function to handle dragging
  const handleDragging = (e) => {
    if (!isDragging.current) return;

    e.preventDefault();
    const x = e.pageX - conveyorRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // Increase walk for faster scroll
    conveyorRef.current.scrollLeft = scrollLeft.current - walk;

    updateFocusClass(); // Dynamically update the focus class during dragging
  };

  const startDragging = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - conveyorRef.current.offsetLeft;
    scrollLeft.current = conveyorRef.current.scrollLeft;
  };

  const stopDragging = () => {
    isDragging.current = false;
  };

  // Function to update the "focus" class
  const updateFocusClass = () => {
    const conveyor = conveyorRef.current;
    const conveyorCenter = conveyor.offsetWidth / 2; // Center point of the conveyor
    const buttons = conveyor.querySelectorAll('.conveyor-item');
    let closestIndex = null;
    let minDistance = Infinity;

    buttons.forEach((button, index) => {
      const buttonCenter = button.offsetLeft + button.offsetWidth / 2;
      const distance = Math.abs(buttonCenter - (conveyor.scrollLeft + conveyorCenter));

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    setFocusedIndex(closestIndex); // Set the closest button to the center as focused
  };

  // Function to handle selecting a season
  const handleSeasonClick = (season) => {
    setSelectedSeason(season === selectedSeason ? null : season); // Toggle season display
  };

  // Function to handle scrolling to the selected week
  const handleWeekButtonClick = (week) => {
    setSelectedWeek(week); // Update the selected week

    // Scroll to the corresponding week section
    const weekSection = document.getElementById(`week-${week}`);
    if (weekSection) {
      weekSection.scrollIntoView({ behavior: 'smooth' }); // Scroll smoothly to the week section
    }
  };

  // Mouse movement for parallax effect on season buttons
  const handleMouseMove = (e, season) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = (y / rect.height - 0.5) * 50; // Reduced parallax effect for subtle movement
    const rotateY = (x / rect.width - 0.5) * -50;

    e.currentTarget.querySelector('.season-square-content').style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.querySelector('.season-square-content').style.transform = 'rotateX(0deg) rotateY(0deg)'; // Reset when mouse leaves
  };

  return (
    <div className="elo-table-container">
      <h2>Premier League ELO Ratings - Full Table</h2>

      {/* Conveyor belt container */}
      <div
        className="conveyor-container"
        ref={conveyorRef}
        onMouseDown={startDragging} // Start drag on mouse down
        onMouseMove={handleDragging} // Drag on mouse move
        onMouseUp={stopDragging} // Stop dragging on mouse up
        onMouseLeave={stopDragging} // Stop dragging if the mouse leaves the area
      >
        {seasons.size > 0 ? (
          <div className="conveyor-track">
            {Array.from(seasons.keys()).map((season, index) => (
              <button
                key={season}
                className={`season-square conveyor-item ${index === focusedIndex ? 'focus' : ''}`}
                onClick={() => handleSeasonClick(season)}
                onMouseMove={(e) => handleMouseMove(e, season)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="season-square-content">
                  {season}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p>No seasons available or data not loaded</p>
        )}
      </div>
      {selectedSeason && (
        <div className="slide-up-section">
          <button className="close-button" onClick={() => setSelectedSeason(null)}>
            V
          </button>

          <div className="content-container">
            {/* Left side: Image */}
            <div className="image-container">
              <img src={`/Images/Season_${selectedSeason}_Image.png`} alt={`Season ${selectedSeason}`} />
            </div>

            {/* Right side: Premier League Table */}
            <PremierLeagueTable season={selectedSeason} />
          </div>

          {/* Game week navigation and matches go below */}
          <div className="game-week-buttons">
            {Array.from(d3.group(seasons.get(selectedSeason), (d) => d.Week).keys()).map((week) => (
              <button
                key={week}
                className="week-button"
                onClick={() => handleWeekButtonClick(week)}
              >
                Week {week}
              </button>
            ))}
          </div>

          <h3>Season {selectedSeason}</h3>
          <div className="matches-by-week">
            {Array.from(d3.group(seasons.get(selectedSeason), (d) => d.Week).entries()).map(
              ([week, matches]) => (
                <div key={week} className="week-section" id={`week-${week}`}>
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
        </div>
      )}
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
      <div className={`elo-change-home ${getColorForEloChange(match.Home_ELO_Change)}`}>
        {match.Home_ELO_Change}
      </div>
      <div className="elo-value-home">{match.Home_ELO_New}</div>
      <div className="logo-home">
        <img src={`/Teams Logos/${match.Home_Team}_Logo.svg`} alt={`${match.Home_Team} Logo`} />
      </div>
      <div className="team-name-home">{match.Home_Team}</div>
      <div className={`goals-home ${getColorForGoals(match.HomeGoals, match.AwayGoals)}`}>
        {match.HomeGoals}
      </div>
      <div className="match-date">{match.Date}</div>
      <div className={`goals-away ${getColorForGoals(match.AwayGoals, match.HomeGoals)}`}>
        {match.AwayGoals}
      </div>
      <div className="team-name-away">{match.Away_Team}</div>
      <div className="logo-away">
        <img src={`/Teams Logos/${match.Away_Team}_Logo.svg`} alt={`${match.Away_Team} Logo`} />
      </div>
      <div className="elo-value-away">{match.Away_ELO_New}</div>
      <div className={`elo-change-away ${getColorForEloChange(match.Away_ELO_Change)}`}>
        {match.Away_ELO_Change}
      </div>
    </div>
  );
};

export default ELOTableMain;
