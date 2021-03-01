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

const app = express();
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.get("/api/images", (request, response) => {
    database.getImages().then((result) => {
        response.json(result.rows);
    });
});

app.post("/upload", (request, response) => {
    // catch errors..
    const uploader = multer({
        storage: diskStorage,
        limits: {
            fileSize: 5242880,
        },
    }).single("file");

    uploader(request, response, function (error) {
        // catch errors..
        // multer error like filesize too big
        if (error instanceof multer.MulterError) {
            console.log(error);
            response.json({
                success: false,
                error: "Error. Maybe filesize to big.",
            });
        } else if (!request.file) {
            console.log("No file selected");
            console.log(response);
            response.json({
                success: false,
                error: "No file selected.",
            });
        } else if (error) {
            console.log("Error. Something else:", error);
            response.json({
                success: false,
                error: "Error. Something went wrong.",
            });
        } else {
            // start with the upload stuff
            console.log("Wow. Upload?");

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
        }
    });
});

//heroku || local
app.listen(process.env.PORT || 8080, () => {
    console.log("🛰️  Listening..");
});
