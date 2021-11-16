//Initial MongoDB
const dbHost = process.env.DB_HOST || "localhost";
const dbPort = process.env.DB_PORT || 27017;
const dbName = process.env.DB_NAME || "motel-demo";

module.exports = {
  database: `mongodb://${dbHost}:${dbPort}/${dbName}`, //DB source
  secret: "nguyenvd3",
};
