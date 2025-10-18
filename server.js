import express from "express";
import router from "./routes/weatherRoutes.js"; // Import the router from weatherRoutes.js
import cropRouter from "./routes/cropRoutes.js"; // Import the router from cropRoutes.js
import routerWithDB from "./routes/weatherRoutesWithDB.js"; // Import the router from weatherRoutesWithDB.js
import cropRouterWithDB from "./routes/cropRoutesWithDB.js"; // Import the router from cropRoutesWithDB.js
import morgan from "morgan";
import cors from "cors";


const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Routes for local data (no DB)
app.use("/api/weather", router);// this is for when u want to add a prefix to the route and access it like localhost:5000/api/weather and use to access all the routes in weatherRoutes.js
app.use("/api/crops", cropRouter); // this is for when u want to add a prefix to the route and access it like localhost:5000/api/crops and use to access all the routes in cropRoutes.js

// Routes for DB
app.use("/api/weather-db", routerWithDB);// this is for when u want to add a prefix to the route and access it like localhost:5000/api/weather-db and use to access all the routes in weatherRoutesWithDB.js
app.use("/api/crops-db", cropRouterWithDB); // this is for when u want to add a prefix to the route and access it like localhost:5000/api/crops-db and use to access all the routes in cropRoutesWithDB.js

// Error handling (catch all)
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port localhost:${PORT}`));
