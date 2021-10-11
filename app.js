const express = require("express");
const mongoose = require("mongoose");

const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const config = require("./config/database");

const properties = require("./routes/properties");

mongoose.connect(config.database, { useNewUrlParser: true });

mongoose.connection.on("connected", () => {
  console.log("Connected to Database:" + config.database);
});

mongoose.connection.on("error", (err) => {
  console.log("Error with connection to DB:" + err);
});

const app = express();

app.use(cors());

app.set("views", __dirname + "/public");
app.set("view engine", "html");

app.use("/property", properties);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("Server started on port: " + port);
});
