require('dotenv').config(); // Load environment variables
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Use dynamic import for node-fetch
async function fetchModule() {
  const fetch = await import('node-fetch');  // Dynamically import node-fetch
  return fetch.default;
}

// Fetch Google Fonts CSS on the server side
async function getGoogleFontsCSS() {
  const fetch = await fetchModule();  // Use dynamically imported fetch
  const fontURLs = [
    process.env.GOOGLE_FONT_OSWALD,
    process.env.GOOGLE_FONT_MERRIWEATHER,
    process.env.GOOGLE_FONT_ARCHIVO,
    process.env.GOOGLE_FONT_ROBOTO_MONO,
    process.env.GOOGLE_FONT_SOURCE_CODE,
    process.env.GOOGLE_FONT_LATO,
  ];

  // Fetch each font URL and return the combined CSS
  const fontPromises = fontURLs.map(url => fetch(url).then(res => res.text()));
  const fontCSSArray = await Promise.all(fontPromises);
  return fontCSSArray.join('\n');  // Combine the fetched CSS
}

// Serve the React app in production (static files)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  // Catch-all route to serve React app and inject fonts
  app.get('*', async (req, res) => {
    try {
      const googleFontsCSS = await getGoogleFontsCSS();  // Fetch Google Fonts CSS

      // Serve the index.html with injected fonts
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Premier League ELO Ratings</title>
            <style>${googleFontsCSS}</style>  <!-- Inject Google Fonts CSS directly -->
            <link rel="stylesheet" href="/bundle.css" />
          </head>
          <body>
            <div id="root"></div>
            <script src="/bundle.js"></script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Error fetching Google Fonts:', error);
      res.status(500).send('Error loading fonts');
    }
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
