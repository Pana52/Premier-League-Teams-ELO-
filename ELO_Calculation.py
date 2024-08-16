import pandas as pd
import os

# Constants (Free to play with)
K_base = 50
alpha = 3
initial_elo = 1000

# Load the dataset
data = pd.read_csv('D:\Premier-League-Teams-ELO-\dataset\premier-league-matches.csv')

# Initialize the ELO ratings
elo_ratings = {}

# Initialize a DataFrame to track ELO changes
columns = ['Season_End_Year', 'Week', 'Date', 'Home_Team', 'Away_Team', 'Result',
           'Home_ELO_Old', 'Home_ELO_New', 'Home_ELO_Change',
           'Away_ELO_Old', 'Away_ELO_New', 'Away_ELO_Change']
elo_log = pd.DataFrame(columns=columns)

# Function to initialize or reset a team's ELO rating
def initialize_team_elo(team):
    if team not in elo_ratings:
        elo_ratings[team] = initial_elo

# Function to calculate the expected score
def expected_score(R_x, R_y):
    return 1 / (1 + 10 ** ((R_y - R_x) / 400))

# Function to calculate the K-factor
def calculate_k_factor(R_x, R_y):
    delta_R = abs(R_x - R_y)
    return K_base * (1 + alpha * delta_R / 400)

# Function to update ELO ratings after a match and log the changes
def update_elo_log(season, week, date, home_team, away_team, home_goals, away_goals):
    initialize_team_elo(home_team)
    initialize_team_elo(away_team)

    R_home = elo_ratings[home_team]
    R_away = elo_ratings[away_team]

    # Calculate the expected scores
    E_home = expected_score(R_home, R_away)
    E_away = expected_score(R_away, R_home)

    # Determine match outcome
    if home_goals > away_goals:
        S_home = 1
        S_away = 0
        result = 'H'
    elif home_goals < away_goals:
        S_home = 0
        S_away = 1
        result = 'A'
    else:
        S_home = 0.5
        S_away = 0.5
        result = 'D'

    # Calculate K-factors
    K_home = calculate_k_factor(R_home, R_away)
    K_away = calculate_k_factor(R_away, R_home)

    # Update ELO ratings
    new_R_home = R_home + K_home * (S_home - E_home)
    new_R_away = R_away + K_away * (S_away - E_away)

    # Log ELO changes
    elo_log.loc[len(elo_log)] = [
        season, week, date, home_team, away_team, result,
        R_home, new_R_home, new_R_home - R_home,
        R_away, new_R_away, new_R_away - R_away
    ]

    # Apply the new ratings
    elo_ratings[home_team] = new_R_home
    elo_ratings[away_team] = new_R_away

# Process each match iteratively
for index, row in data.iterrows():
    season = row['Season_End_Year']
    week = row['Wk']
    date = row['Date']
    home_team = row['Home']
    away_team = row['Away']
    home_goals = row['HomeGoals']
    away_goals = row['AwayGoals']

    # Initialize teams for the new season if they haven't been processed yet
    initialize_team_elo(home_team)
    initialize_team_elo(away_team)

    # Update ELO ratings based on the match result and log the changes
    update_elo_log(season, week, date, home_team, away_team, home_goals, away_goals)

# Apply the end-of-season logic (for relegated and promoted teams)
def end_of_season_update(current_season):
    teams_in_season = set(data[data['Season_End_Year'] == current_season]['Home']).union(
        set(data[data['Season_End_Year'] == current_season]['Away']))

    # Freeze ELO of relegated teams (not in the next season)
    for team in list(elo_ratings.keys()):
        if team not in teams_in_season:
            elo_ratings[team] = 0  # ELO frozen at 0

# Process end-of-season updates
for season in data['Season_End_Year'].unique():
    end_of_season_update(season)

# Save the master ELO log to an Excel file
output_file = 'ELO_Ratings_Log.xlsx'
with pd.ExcelWriter(output_file) as writer:
    elo_log.to_excel(writer, sheet_name='ELO Log', index=False)

# Create separate Excel files for each team with only the required columns
teams = elo_log['Home_Team'].unique()
output_directory = 'Team_ELO_Logs'
os.makedirs(output_directory, exist_ok=True)

for team in teams:
    team_log = elo_log[(elo_log['Home_Team'] == team) | (elo_log['Away_Team'] == team)][['Date', 'Season_End_Year', 'Week', 'Home_Team', 'Away_Team', 'Home_ELO_New', 'Away_ELO_New']]
    team_log = team_log.rename(columns={'Home_ELO_New': 'Home_Current_ELO', 'Away_ELO_New': 'Away_Current_ELO'})  # Rename column for clarity
    team_file = os.path.join(output_directory, f'{team}_ELO_Log.xlsx')
    with pd.ExcelWriter(team_file) as writer:
        team_log.to_excel(writer, sheet_name=f'{team} ELO Log', index=False)

print(f"ELO ratings changes have been saved to {output_file}")
print(f"Separate ELO logs for each team have been saved in the '{output_directory}' directory.")

# Display final ELO ratings
final_elo_df = pd.DataFrame.from_dict(elo_ratings, orient='index', columns=['Final ELO Rating'])
final_elo_df = final_elo_df.sort_values(by='Final ELO Rating', ascending=False)

# Print final ELO ratings
print("Final ELO Ratings:")
print(final_elo_df)
