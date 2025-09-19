const express = require('express');
const expressHbs = require("express-handlebars");
const session = require('express-session');
const cookieParser = require('cookie-parser');


const app = express();
const port = 8080;

const hbs = expressHbs.create({
    extname: ".hbs",
    defaultLayout: "main.hbs",
    layoutsDir: "views/layouts/",
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'bibek',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));
app.use("/static", express.static(__dirname + "/public"));

app.use('/', require('./routes/page'));
app.use('/path', require('./routes/path'));


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});



