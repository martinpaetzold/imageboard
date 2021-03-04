const spicedPG = require("spiced-pg");
//heroku || local
const db = spicedPG(
    process.env.DATABASE_URL ||
        "postgres:martinpaetzold:@localhost:5432/imageboard"
);

//get the url, title, username, description
exports.getImages = () => {
    return db.query(`SELECT * FROM images ORDER BY created_at DESC LIMIT 6;`);
};

//get image by id (e.g. overlay)
exports.getImageById = (id) => {
    return db.query(`SELECT * FROM images WHERE id=$1;`, [id]);
};

//get amount of images
exports.getAmountOfImages = () => {
    return db.query(`SELECT count(id) FROM images`);
};

//get images the nice way
exports.getMoreImages = (lastId) => {
    return db.query(
        `SELECT * FROM images WHERE id < $1 ORDER BY id DESC LIMIT 6`,
        [lastId]
    );
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

//post comment => DB
exports.postCommentToDB = (user_id, image_id, comment) => {
    return db.query(
        `INSERT INTO comments
            (user_id, image_id, comment)
            VALUES ($1, $2, $3)
            RETURNING *;`,
        [user_id, image_id, comment]
    );
};

//get comments from choosen image
exports.getCommentsByImageId = (id) => {
    return db.query(
        `SELECT * FROM comments WHERE image_id=$1
         ORDER BY created_at DESC;`,
        [id]
    );
};
