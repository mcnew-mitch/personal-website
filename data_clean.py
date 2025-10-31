import pandas as pd

# Load the socialMedia.csv file
df = pd.read_csv("socialMedia.csv")

# 1. Generate socialMediaAvg.csv (Part 2.2)
# Group by Platform and PostType and calculate the mean of Likes
df_avg = df.groupby(['Platform', 'PostType'])['Likes'].mean().reset_index()
df_avg = df_avg.rename(columns={'Likes': 'AvgLikes'})
# Round to 2 decimal places
df_avg['AvgLikes'] = df_avg['AvgLikes'].round(2)

# Display and save the file
df_avg.to_csv("socialMediaAvg.csv", index=False)
print("--- socialMediaAvg.csv (Preview) ---")
print(df_avg.head().to_markdown(index=False))

# 2. Generate socialMediaTime.csv (Part 2.3)

# Convert PostTimestamp to datetime objects
df['PostTimestamp'] = pd.to_datetime(df['PostTimestamp'])

df['Date'] = df['PostTimestamp'].dt.date

# Group by the extracted Date and calculate the mean of Likes
df_time = df.groupby('Date')['Likes'].mean().reset_index()
df_time = df_time.rename(columns={'Likes': 'AvgLikes'})
# Round to 2 decimal places
df_time['AvgLikes'] = df_time['AvgLikes'].round(2)

# Display and save the file
df_time.to_csv("socialMediaTime.csv", index=False)
print("\n--- socialMediaTime.csv (Preview) ---")
print(df_time.head().to_markdown(index=False))
