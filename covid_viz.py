import ssl
import certifi
ssl._create_default_https_context = lambda: ssl.create_default_context(cafile=certifi.where())

import pandas as pd
import plotly.express as px

# Load data
url = "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv"
df = pd.read_csv(url, parse_dates=["date"])

# Filter to countries
countries = [
    "United States", "United Kingdom", "Germany", "Brazil",
    "Canada", "Mexico", "Ireland", "China", "Russia", "Australia"
]
df = df[df["location"].isin(countries)]

# Chart 1 — Trends over time
fig1 = px.line(
    df,
    x="date",
    y="new_cases_smoothed_per_million",
    color="location",
    title="COVID-19 New Cases per Million (7-day avg)",
    labels={
        "new_cases_smoothed_per_million": "Cases per Million",
        "date": "Date",
        "location": "Country"
    }
)
fig1.write_html("covid_cases.html")
print("Chart 1 saved: covid_cases.html")

# Chart 2 — Country comparison
summary = df.groupby("location")["total_deaths_per_million"].max().reset_index()

fig2 = px.bar(
    summary,
    x="location",
    y="total_deaths_per_million",
    color="location",
    title="Total COVID Deaths per Million by Country",
    labels={
        "total_deaths_per_million": "Deaths per Million",
        "location": "Country"
    }
)
fig2.write_html("covid_deaths.html")
print("Chart 2 saved: covid_deaths.html")

print("\nDone! Open the .html files in your browser.")
