import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
  ┌──────────────────────────────────────┐
  │                                      │
  │   🏠 EasyPG API Server               │
  │   Running on http://localhost:${PORT}   │
  │   Environment: ${process.env.NODE_ENV || "development"}           │
  │                                      │
  └──────────────────────────────────────┘
  `);
});
