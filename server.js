const express = require("express");
const app = express();

app.use(express.static("public"));

app.get("/api/animals", (request, response) => {
    const animals = [
        { name: "Turtles", image: "🐢" },
        { name: "Facebook", image: "🐙" },
        { name: "Scorpions", image: "🦂" },
        { name: "Dogs", image: "🐕" },
        { name: "Monkeys", image: "🐒" },
    ];
    response.json(animals);
});

//heroku || local
app.listen(process.env.PORT || 8080, () => {
    console.log("🛰️  listening..");
});
