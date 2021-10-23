const express = require("express");
const passport = require("passport");
const mongoose = require("mongoose");

const path = require("path");

const bodyParser = require("body-parser");

const cors = require("cors");

const config = require("./config/database");

const properties = require("./routes/properties");
const users = require("./routes/users");
const upload = require("./routes/upload");

mongoose.connect(config.database, { useNewUrlParser: true });

mongoose.connection.on("connected", () => {
  console.log("Connected to Database:" + config.database);
});

mongoose.connection.on("error", (err) => {
  console.log("Error with connection to DB:" + err);
});

mongoose.set("useFindAndModify", false);
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

const app = express();

app.use(cors());

app.set("views", __dirname + "/public");
app.set("view engine", "html");

app.use(bodyParser.json());

app.use(passport.initialize());

app.use(passport.session());
require("./config/passport")(passport);

app.use("/property", properties);
app.use("/uploads", upload);
app.use("/user", users);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("Server started on port: " + port);
});
