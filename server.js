const express = require("express");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const database = require("./database.js");
const s3 = require("./s3.js");

const diskStorage = multer.diskStorage({
    destination: (request, file, callback) => {
        const destinationDirectory = __dirname + "/uploads";
        callback(null, destinationDirectory);
    },
    filename: (request, file, callback) => {
        uidSafe(24).then((uuid) => {
            const originalExtension = path.extname(file.originalname);
            const filename = uuid + originalExtension;
            callback(null, filename);
        });
    },
});

const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/api/images", (request, response) => {
    database.getImages().then((result) => {
        response.json(result.rows);
    });
});

app.get("/api/image/:id", (request, response) => {
    const { id } = request.params;

    database
        .getImageById(id)
        .then((results) => {
            if (results.rows[0]) {
                response.json({
                    success: true,
                    ...results.rows[0],
                });
            } else {
                response.status(404).json({ success: false });
            }
        })
        .catch((error) => {
            response.status(500).json({ success: false });
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
            response.status(400).json({
                success: false,
                error: "Error. Maybe filesize to big.",
            });
        } else if (!request.file) {
            console.log("No file selected");
            console.log(response);
            response.status(400).json({
                success: false,
                error: "No file selected.",
            });
        } else if (error) {
            console.log("Error. Something else:", error);
            response.status(400).json({
                success: false,
                error: "Error. Something went wrong.",
            });
        } else {
            // start with the upload stuff
            console.log("Wow. Upload?");

            console.log("Awesome. Uploading..");
            console.log("request.body", request.body);
            console.log("request.file", request.file);

            //s3
            const fileURL = s3.getS3URL(request.file.filename);

            // Send response with uploaded file info
            Promise.all([
                database.postImageToDB(
                    fileURL,
                    request.body.title,
                    request.body.username,
                    request.body.description
                ),
                s3.uploadFile(request.file),
            ]).then((results) => {
                response.json({
                    success: true,
                    fileURL,
                });
            });
        }
    });
});

//comments
app.post("/api/comment-add-as-json", (request, response) => {
    console.log("request.body", request.body);

    const { imageId, comment } = request.body;

    //post comment => DB
    database.postCommentToDB("Testuser", imageId, comment).catch((error) => {
        response.json({
            success: false,
        });
    });
});

//heroku || local
app.listen(process.env.PORT || 8080, () => {
    console.log("🛰️  Listening..");
});
