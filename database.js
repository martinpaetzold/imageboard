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
    return db.query(`SELECT * FROM comments WHERE id=$1;`, [id]);
};
