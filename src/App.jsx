import React from 'react';
import TeamList from './components/TeamList';  // Import the TeamList component
import ELOTableMain from './components/ELOTableMain';

const App = () => {
    return (
        <div>
            <header>
                <h1>Premier League ELO Ratings</h1>
            </header>
            
            <nav>
                <ul>
                    <li><a href="#home">Home</a></li>
                    <li><a href="#ELO">ELO</a></li>
                    <li><a href="#Teams">Teams</a></li>
                    <li><a href="#about">About</a></li>
                </ul>
            </nav>
            
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
                {/* Replacing the static input, button, and teamList divs with TeamList component */}
                <TeamList />  
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
