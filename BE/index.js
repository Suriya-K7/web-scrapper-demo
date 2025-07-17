require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PORT } = require("./utils/config");
const scrapperRouter = require("./routes/scrapperRoutes");

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Connected");
});

app.use(scrapperRouter);

app.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`);
});
