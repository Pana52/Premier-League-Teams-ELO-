import React, { useState, useEffect } from 'react';
import './TeamList.css'; // Assuming you have some styles for team boxes and containers
import TeamGraph from './TeamGraph'; // Import the TeamGraph component

const teamNames = ["Arsenal", "Aston Villa", "Barnsley", "Birmingham City", "Blackburn", "Blackpool", "Bolton", "Bournemouth", "Bradford City", "Brentford", "Brighton", "Burnley", "Cardiff City", "Charlton Ath", "Chelsea", "Coventry City", "Crystal Palace", "Derby County", "Everton", "Fulham", "Huddersfield", "Hull City", "Ipswich Town", "Leeds United", "Leicester City", "Liverpool", "Manchester City", "Manchester Utd", "Middlesbrough", "Newcastle Utd", "Norwich City", "Nott'ham Forest", "Oldham Athletic", "Portsmouth", "QPR", "Reading", "Sheffield Utd", "Sheffield Weds", "Southampton", "Stoke City", "Sunderland", "Swansea City", "Swindon Town", "Tottenham", "Watford", "West Brom", "West Ham", "Wigan Athletic", "Wimbledon", "Wolves"];

const TeamList = () => {
  const [filteredTeams, setFilteredTeams] = useState(teamNames);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  // Filter the teams based on the search input
  useEffect(() => {
    setFilteredTeams(
      teamNames.filter(team =>
        team.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  const toggleTeamData = (team) => {
    setSelectedTeam(selectedTeam === team ? null : team);
  };

  return (
    <div>
      <input
        type="text"
        id="teamSearch"
        placeholder="Search for a team..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={() => setSearchTerm('')}>Reset</button>

      <div id="teamList">
        {filteredTeams.map((team) => (
          <div key={team} className="teamBox">
            <h3 onClick={() => toggleTeamData(team)}>{team}</h3>
            {selectedTeam === team && <TeamGraph team={team} />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamList;
