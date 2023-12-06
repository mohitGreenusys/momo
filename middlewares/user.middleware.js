const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user.model.js");

const auth = async (req, res, next) => {
  try {
    // console.log(req.headers,"token");
    if (!req.headers.authorization){
      return res.status(401).send({ error: "Unauthorized" });
}
    const token = req.headers.authorization.split(" ")[1];

    if (token) {
      try {
        const decodedData = jwt.verify(token, process.env.TOKEN_SECRET);
        const id = decodedData?._id;
        // console.log(id,"id");
        // const role = decodedData?.role;
        if (!mongoose.Types.ObjectId.isValid(id))
          return res.status(404).json({ error: "No user with that id" });

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: "User not found" });
        // req.role = role;
        req.userId = id;
        next();
      } catch (err) {
        if (err.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({ error: "Token expired, please log in again" });
        }
        throw err; // Throw other errors for generic error handling
      }
    } else {
      return res.status(401).send({ error: "Found Unauthorized" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// export default auth;
module.exports = auth;
