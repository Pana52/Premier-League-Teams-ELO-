import pandas as pd
import os

# Load the master ELO log file
elo_log = pd.read_csv('public/ELO_Ratings_Log.csv')

# Create separate CSV files for each team with only the required columns
teams = elo_log['Home_Team'].unique()
output_directory = 'public/Team_ELO_Logs'
os.makedirs(output_directory, exist_ok=True)

for team in teams:
    team_log_home = elo_log[elo_log['Home_Team'] == team][['Date', 'Season_End_Year', 'Week', 'Home_ELO_New']]
    team_log_away = elo_log[elo_log['Away_Team'] == team][['Date', 'Season_End_Year', 'Week', 'Away_ELO_New']]

    # Rename ELO column to a uniform name
    team_log_home = team_log_home.rename(columns={'Home_ELO_New': 'ELO'})
    team_log_away = team_log_away.rename(columns={'Away_ELO_New': 'ELO'})

    # Concatenate home and away logs
    team_log = pd.concat([team_log_home, team_log_away]).sort_values(by=['Season_End_Year', 'Week', 'Date'])

    # Save the team log to a CSV file
    team_file = os.path.join(output_directory, f'{team}_ELO_Log.csv')
    team_log.to_csv(team_file, index=False)

print(f"Separate ELO logs for each team have been saved as CSV files in the '{output_directory}' directory.")
