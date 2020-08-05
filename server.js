

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

// DB URL
const uri = "mongodb+srv://mejiokre:jjy112808@cluster0-fw9mw.gcp.mongodb.net/muklatdb?retryWrites=true&w=majority"

// Mongo Setup
mongoose.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
let db = mongoose.connection;

// Check DB connection
db.once('open', function () {
    console.log("connected");
});

db.on('error', function (err) {
    console.log('err');
});

// Init App
const app = express();

// // Init gfs
// let gfs;

// conn.once('open', () => {
//     // Init stream
//     gfs = Grid(conn.db, mongoose.mongo);
//     gfs.collection('uploads');
//   });
  
// Create storage engine
// const storage = new GridFsStorage({
//     url: mongoURI,
//     file: (req, file) => {
//       return new Promise((resolve, reject) => {
//         crypto.randomBytes(16, (err, buf) => {
//           if (err) {
//             return reject(err);
//           }
//           const filename = buf.toString('hex') + path.extname(file.originalname);
//           const fileInfo = {
//             filename: filename,
//             bucketName: 'uploads'
//           };
//           resolve(fileInfo);
//         });
//       });
//     }
//   });
//   const upload = multer({ storage });

// Bring in Models
const Article = require('./models/articles');
// const {
//     Router
// } = require('express');

//Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));
app.use(methodOverride('_method'));



// Home Route
app.get("/", function (req, res) {
    res.render("index");
});

// Articles Route   
app.get("/articles", function (req, res) {
    Article.find({}, function (err, articles) {
        if (err) {
            console.log(err);
        } else {
            res.render('articles', {
                articles: articles
            });
        };
    }).sort({_id: -1}) // Reverse
});

// Compose Route
app.get("/compose", function (req, res) {
    res.render("compose");
})

app.post("/compose", function (req, res) {
    let article = new Article();

    article.title = req.body.title;
    article.author = req.body.author;
    article.image = req.body.image;
    article.body = req.body.body;

    article.save(function (err) {
        if (err) {
            console.log(err);
            return;
        } else {
            res.redirect('/articles');
        }
    })
})

// Single Article View
app.get("/articles/:id", function (req, res) {
    const requestedPostId = req.params.id;

    Article.findOne({
        _id: requestedPostId
    }, function (err, articles) {
        res.render("post", {
            articles: articles
        });
    });
});

// Load up Edit Form

app.get("/articles/edit/:id", function (req, res) {
    const requestedPostId = req.params.id;

    Article.findOne({
        _id: requestedPostId
    }, function (err, articles) {
        res.render("edit_post", {
            articles: articles
        });
    });
});

// Update Article/Post

app.post("/articles/edit/:id", function (req, res) {
    let article = {};

    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {
        _id: req.params.id
    };

    Article.updateOne(query, article, function (err) {
        if (err) {
            console.log(err);
            return;
        } else {
            res.redirect('/articles');
        }
    });
});

// Delete Post
app.delete("/articles/:id", function (req, res) {

    Article.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/articles");
        } else {
            res.redirect("/articles");
        }
    });
});

// About Route
app.get("/about", function (req, res) {
    res.render("about");
});

// Start Server
app.listen(3000, function () {
    console.log('Server running on port 3000...')
});