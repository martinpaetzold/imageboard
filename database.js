const spicedPG = require("spiced-pg");
//heroku || local
const db = spicedPG(
    process.env.DATABASE_URL ||
        "postgres:martinpaetzold:@localhost:5432/imageboard"
);

//get the url, title, username, description
exports.getImages = () => {
    return db.query(`SELECT * FROM images;`);
};

//get image by id (e.g. overlay)
exports.getImageById = (id) => {
    return db.query(`SELECT * FROM images WHERE id=$1;`, [id]);
};

//post image => DB
exports.postImageToDB = (url, title, username, description) => {
    return db.query(
        `INSERT INTO images
            (url, title, username, description)
            VALUES ($1, $2, $3, $4)
            RETURNING *;`,
        [url, title, username, description]
    );
};
