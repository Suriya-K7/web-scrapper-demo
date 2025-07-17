require("dotenv").config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT;

module.exports = {
  OPENAI_API_KEY,
  PORT,
};
