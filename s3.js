const aws = require("aws-sdk");
const fs = require("fs");
const config = require("./config.json");

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("./secrets.json"); // in dev they are in secrets.json which is listed in .gitignore
}

const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
});

exports.uploadFile = (fileToUpload) => {
    const { filename, mimetype, size, path } = fileToUpload;

    return s3
        .putObject({
            Bucket: "spicedling",
            ACL: "public-read",
            Key: filename,
            Body: fs.createReadStream(path),
            ContentType: mimetype,
            ContentLength: size,
        })
        .promise();
};

exports.getS3URL = (filename) => {
    return config.s3Url + filename;
};
