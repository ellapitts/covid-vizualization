import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve the built React app (static files from dist/)
app.use(express.static(path.join(__dirname, "dist")));

// Serve covid_data.json from public/ during dev if needed
app.use("/public", express.static(path.join(__dirname, "public")));

// Catch-all: send index.html for any route (SPA support)
app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});