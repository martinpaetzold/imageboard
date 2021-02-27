const express = require("express");
const database = require("./database.js");

const app = express();
app.use(express.static("public"));

app.get("/api/images", (request, response) => {
    database.getImages().then((result) => {
        response.json(result.rows);
    });
});

//heroku || local
app.listen(process.env.PORT || 8080, () => {
    console.log("🛰️  listening..");
});
