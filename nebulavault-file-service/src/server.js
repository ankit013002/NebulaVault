const app = require("./app");
const mongoose = require("mongoose");

require("dotenv").config();

const PORT = process.env.PORT || 5000;

async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGOOSE_URI);
    console.log("Connected to File Metadata DB");
  } catch (err) {
    console.error(`Error connecting to DB: ${err}`);
    process.exit(1);
  }
}

connectToDB();

app.listen(PORT, () => console.log(`File service listening on PORT:${PORT}`));
