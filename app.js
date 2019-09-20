const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const expressValidator = require("express-validator");
require("dotenv").config();

const auth = require("./routes/auth");
const user = require("./routes/user");
const category = require("./routes/category");
const product = require("./routes/product");
const braintree = require("./routes/braintree");
const order = require("./routes/order");

const app = express();

mongoose.connect(process.env.DATABASE, {
    useUnifiedTopology:true,
    useNewUrlParser: true,
    useCreateIndex: true
}).then(() => console.log("DB connected"));

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());

app.use("/api", auth);
app.use("/api", user);
app.use("/api", category);
app.use("/api", product);
app.use("/api", braintree);
app.use("/api", order);

const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});