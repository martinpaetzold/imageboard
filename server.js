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

app.get("/api/images/amount", (request, response) => {
    database.getAmountOfImages().then((result) => {
        response.json(result.rows);
    });
});

app.get("/api/images/next/:id", (request, response) => {
    const { id } = request.params;
    database.getMoreImages(id).then((results) => {
        response.json(results.rows);
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
    const uploaderLocal = multer({
        storage: diskStorage,
        limits: {
            fileSize: 5242880,
        },
    }).single("image");

    uploaderLocal(request, response, function (error) {
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
        }
    });
});

//comments
app.post("/api/comment-add", (request, response) => {
    console.log("request.body", request.body);

    const { commentUser, imageId, comment } = request.body;

    //post comment => DB
    database.postCommentToDB(commentUser, imageId, comment).catch((error) => {
        response.status(200).json({
            success: true,
        });
    });
});

//get comments > image id
app.get("/api/comments/:id", (request, response) => {
    const { id } = request.params;

    database
        .getCommentsByImageId(id)
        .then((results) => {
            if (results.rows[0]) {
                response.json({
                    success: true,
                    comments: results.rows,
                });
            } else {
                response.status(404).json({ success: false });
            }
        })
        .catch((error) => {
            response.status(500).json({ success: false });
        });
});

//heroku || local
app.listen(process.env.PORT || 8080, () => {
    console.log("???????  Listening..");
});
