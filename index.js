const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const adminRouter = require("./routes/admin.routes");
const userRouter = require("./routes/user.routes");
const dotenv = require("dotenv")

const app = express();
dotenv.config()

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(morgan("dev"));
app.use(cors({
    origin:"*",
    methods:'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials:true
}));

app.use("/admin", adminRouter);
app.use("/user", userRouter);

app.get("/", (req, res) => {
    return res.send("i am alive baby💕");
});

app.use("/test", (req, res) => {
    res.send("Hello World!");
  });

// app.listen(2000, () => {
//     console.log("Server is running on port 6000");
// });

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(7000, () => {
      console.log(`Server running on port ${7000}`);
    })
  )
  .catch((err) => console.log(err));

// mongoose.connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => {
//     console.log("Connected to database");
// }
// ).catch((error) => {
//     console.log("Database connection failed", error);
// });