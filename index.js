import express from "express";
import ejsLayouts from "express-ejs-layouts";
import path from 'path';
import BusinessController from "./src/controllers/business.controller.js"
import route from './src/routes/routes.js'
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';


const server = express();
const PORT = process.env.PORT || "3100";

// middleware
server.use(cookieParser());
server.use(express.static('public'));
server.use(express.urlencoded({ extended: true }));

server.use(session({
    secret: process.env.SESSION_SECRET,       // Replace with a secure key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }        // Set `true` for HTTPS
}));

server.set('view engine', 'ejs');
server.set('views', path.join(path.resolve(), 'src', 'views'))
server.use(ejsLayouts);
server.use(express.json());

const businessController = new BusinessController();

server.use('/', route);

// Default route
server.get('/', (req, res) => {
    res.render('login', { message: null });
  });
server.get('/api/location', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: "Query parameter is missing" });
    }

    const apiKey = "d9a0d19eb39945f98c94b9138eb8d6d0";
    const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}&limit=5&countrycode=IN`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const suggestions = data.results.map(result => ({
            name: result.formatted,
            lat: result.geometry.lat,
            lng: result.geometry.lng,
        }));

        res.json(suggestions);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Failed to fetch location suggestions" });
    }
});




server.listen(PORT, ()=> console.log(`server is listening on port ${PORT}`) );

