const spicedPG = require("spiced-pg");
//heroku || local
const db = spicedPG(
    process.env.DATABASE_URL ||
        "postgres:martinpaetzold:@localhost:5432/imageboard"
);

//get the url, title
exports.getImages = () => {
    return db.query(`SELECT * FROM images;`);
};
