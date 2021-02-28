const express = require("express");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const database = require("./database.js");
const { report } = require("process");

const diskStorage = multer.diskStorage({
    destination: function (request, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function (request, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    },
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 5242880,
    },
});

const app = express();
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.get("/api/images", (request, response) => {
    database.getImages().then((result) => {
        response.json(result.rows);
    });
});

app.post("/upload", uploader.single("file"), (request, response) => {
    // catch errors..

    console.log("Awesome. Uploading..");

    console.log("request.body", request.body);
    console.log("request.file", request.file);

    // TODO: Save file info to database
    const fileURL = "/uploads/" + request.file.filename;
    // s3 url
    const fileURLforDB =
        // "https://s3.amazonaws.com/XYZ/spicedXYZ/" + request.file.filename;
        "http://localhost:8080/uploads/" + request.file.filename;
    console.log(fileURLforDB);

    // postImageToDB(url, title, username, decription)

    // Send response with uploaded file info
    Promise.all([
        database.postImageToDB(
            fileURLforDB,
            request.body.title,
            request.body.username,
            request.body.description
        ),
    ]).then((results) => {
        const image = results[0].rows[0];
        console.log(image);
        response.json({
            success: true,
            image,
        });
        // bug: image not shown (file object not updated...?!)
        // db input works fine.
    });
});

//heroku || local
app.listen(process.env.PORT || 8080, () => {
    console.log("🛰️  Listening..");
});
