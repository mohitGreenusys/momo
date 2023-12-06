const Admin = require("../models/admin.model.js");
const { adminValidation, slotValidation } = require("../utils/joi.validations");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { loginValidation } = require("../utils/joi.validations");
const slotModel = require("../models/slot.model.js");
const userModel = require("../models/user.model.js");
const mongoose = require("mongoose");

const routes = {};

routes.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const { error } = adminValidation.validate(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
    });

    const savedAdmin = await admin.save();

    return res
      .status(200)
      .json({ msg: "Admin registered successfully", admin: savedAdmin });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error: error });
  }
};

routes.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { error } = loginValidation.validate(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(400).json({ msg: "invalid email" });

    const comparePassword = await bcrypt.compare(password, admin.password);

    if (!comparePassword)
      return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ _id: admin._id }, process.env.TOKEN_SECRET, {
      expiresIn: "5d",
    });

    return res
      .status(200)
      .json({ msg: "Admin logged in successfully", token: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error: error });
  }
};

routes.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.userId).select("-password");

    return res
      .status(200)
      .json({ msg: "Admin profile fetched successfully", admin });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

routes.updatePaymentDetails = async (req, res) => {
  try {
    const { upiId, qrCode } = req.body;

    const updateFields = {};

    if (upiId !== undefined) {
      updateFields.upiId = upiId;
    }

    if (qrCode !== undefined) {
      updateFields.qrCode = qrCode;
    }

    const admin = await Admin.findByIdAndUpdate(req.userId, updateFields, {
      new: true,
    });

    return res
      .status(200)
      .json({ msg: "Payment details updated successfully", admin });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error: error });
  }
};

routes.createSlot = async (req, res) => {
  try {
    const { timeRanges, slotPrice, numberOfSlots, date } = req.body;

    const { error } = slotValidation.validate(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const today = new Date(date);
    const todaysDatelastSlot = await slotModel
      .find({
        date: {
          $gte: today.setHours(0, 0, 0, 0),
          $lt: today.setHours(23, 59, 59, 999),
        },
      })
      .sort({ createdAt: -1 })
      .limit(1);

    var slotNumber = 1;

    if (todaysDatelastSlot[0]) {
      slotNumber = todaysDatelastSlot[0]?.slotNumber + 1;
    }

    for (let i = 0; i < numberOfSlots; i++) {
      const slot = new slotModel({
        slotNumber,
        timeRanges,
        slotPrice,
        date,
      });
      slotNumber += 1;
      await slot.save();
    }

    return res.status(200).json({ msg: "Slot created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error: error });
  }
};

routes.getSlots = async (req, res) => {
  try {
    const inputDate = req.query.date;
    var slots = [];
    if (inputDate) {
      const date = new Date(inputDate);
      slots = await slotModel
        .find({
          date: {
            $gte: date.setHours(0, 0, 0, 0),
            $lt: date.setHours(23, 59, 59, 999),
          },
        })
        .populate("user");
    } else {
      slots = await slotModel.find().populate("user");
    }

    return res.status(200).json({ msg: "Slots fetched successfully", slots });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error: error });
  }
};

routes.getSlot = async (req, res) => {
  try {
    const slotId = req.params.id;

    const slot = await slotModel.findById(slotId).populate("user");

    return res.status(200).json({ msg: "Slot fetched successfully", slot });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error: error });
  }
};

routes.updateSlot = async (req, res) => {
  try {
    const slotId = req.query.slotId;
    const status = req.query.status;

    if (!mongoose.Types.ObjectId.isValid(slotId))
      return res.status(404).json({ msg: "invalid slot id" });

    if (!slotId || !status) {
      return res.status(400).json({ msg: "Invalid request" });
    }

    if (status !== "available" && status !== "booked" && status !== "pending") {
      return res.status(400).json({ msg: "Invalid status" });
    }

    if(status === "available"){
      
      const slot = await slotModel.findByIdAndUpdate(slotId, {
        status,
        user: null,
        paymentReferenceNumber: null,
        paymentBy: null,
        updatedAt: Date.now(),
      });

      const user = await userModel.findById(slot?.user);
  
      if (user) {
        user.bookings = user?.bookings.filter((slot) => slot !== slotId);
  
        await user.save();
      }
    }else{

      const slot = await slotModel.findByIdAndUpdate(slotId, {
        status,
        updatedAt: Date.now(),
      });

    }

    return res.status(200).json({ msg: "Slot updated successfully", });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error: error });
  }
};

routes.deleteSlot = async (req, res) => {
  try {
    const slotId = req.query.slotId;

    if (!slotId) {
      return res.status(400).json({ msg: "Invalid request" });
    }
    if (!mongoose.Types.ObjectId.isValid(slotId))
      return res.status(404).json({ msg: "invalid slot id" });

    const slot = await slotModel.findById(slotId);

    if (!slot) {
      return res.status(400).json({ msg: "Slot not found" });
    }

    if (slot.status === "booked") {
      return res.status(400).json({
        msg: "Slot already booked. please change the status to available",
      });
    }

    if (slot.status === "pending") {
      return res.status(400).json({
        msg: "Slot already pending. please change the status to available",
      });
    }

    await slotModel.findByIdAndDelete(slotId);

    // const slot = await slotModel.findByIdAndDelete(slotId);

    return res.status(200).json({ msg: "Slot deleted successfully", slot });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error: error });
  }
};

routes.allUsers = async (req, res) => {
  try {
    const users = await userModel.find();

    return res.status(200).json({ msg: "Users fetched successfully", users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error: error });
  }
};

routes.getUser = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ msg: "Invalid request" });
    }

    const user = await userModel.findById(userId).populate("bookings");

    return res.status(200).json({ msg: "User fetched successfully", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error: error });
  }
};

module.exports = routes;
