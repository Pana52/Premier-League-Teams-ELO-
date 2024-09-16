import React, { useEffect, useState } from 'react';
import TeamList from './components/TeamList';  // Import the TeamList component
import ELOTableMain from './components/ELOTableMain';

// Function to dynamically load Google Fonts
const loadGoogleFonts = (fonts) => {
  Object.values(fonts).forEach((fontUrl) => {
    const link = document.createElement('link');
    link.href = fontUrl;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  });
};

const App = () => {
  const [fonts, setFonts] = useState({});

  useEffect(() => {
    fetch('/api/fonts')
      .then(response => {
        console.log('Response:', response);
        if (!response.ok || !response.headers.get('Content-Type')?.includes('application/json')) {
          throw new Error('Received non-JSON response or invalid response');
        }
        return response.json();
      })
      .then(data => {
        console.log('Font data:', data);
        setFonts(data);
        loadGoogleFonts(data);
      })
      .catch(error => {
        console.error('Error fetching fonts:', error);
      });
  }, []);

  return (
    <div>
      <div id="navbar">
        <header>
          <h1 style={{ fontFamily: "'Oswald', sans-serif" }}>Premier League ELO Ratings</h1>
        </header>
      
        <nav>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#ELO">ELO</a></li>
            <li><a href="#Teams">Teams</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </nav>
      </div>
      
      {/* Home Section */}
      <section id="home">
        <h2>Home</h2>
        <p>Welcome to the Premier League ELO Ratings page.</p>
      </section>
      
      {/* ELO Ratings Section */}
      <section id="ELO">
        <h2>ELO Ratings</h2>
        <p>Here you will find the ELO ratings and results of matches from the Premier League.</p>
        <ELOTableMain /> {/* Display the ELO table in the ELO section */}
      </section>
      
      {/* Teams Section */}
      <section id="Teams">
        <h2>Teams</h2>
        <TeamList />  {/* Display the TeamList component */}
      </section>
      
      {/* About Section */}
      <section id="about">
        <h2>About</h2>
        <p>This project presents the ELO ratings of Premier League teams over the years.</p>
      </section>
    </div>
  );
};

export default App;
