const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/user.model");
const Slot = require("../models/slot.model");
const { registerValidation, loginValidation } = require("../utils/joi.validations");
const adminModel = require("../models/admin.model");

const routes = {};

routes.register = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    const { error } = registerValidation.validate(req.body);
    if (error) return res.status(200).json({ msg: error.details[0].message });

    const ifuserExists = await User.findOne({ email });

    if (ifuserExists)
      return res.status(200).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    const savedUser = await user.save();

    return res
      .status(200)
      .json({ msg: "User registered successfully", user: savedUser });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error: error });
  }
};

routes.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { error } = loginValidation.validate(req.body);
    if (error) return res.status(200).json({ msg: error.details[0].message });

    const user = await User.findOne({ email });

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword)
      return res.status(200).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "5d",
    });

    return res
      .status(200)
      .json({ msg: "User logged in successfully", token: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error: error });
  }
};

routes.getProfile = async (req, res) => {
    try {
        
        const user = await User.findById(req.userId).select("-password") ;

        return res
        .status(200)
        .json({ msg: "User profile fetched successfully", user: user });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Internal server error", error: error });
    }
}

routes.getSlots = async (req, res) => {
  try {
    const today = new Date();

    const slots = await Slot.find({
      date: {
        $gte: today.setHours(0, 0, 0, 0),
        $lt: today.setHours(23, 59, 59, 999),
      },
    });

    return res.status(200).json({ msg: "Slots fetched successfully", slots });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error: error });
  }
};
   

routes.bookSlot = async (req, res) => {
    try {
        const { slotId } = req.body;
    
        const slot = await Slot.findById(slotId);
    
        if (!slot) return res.status(400).json({ msg: "Slot not found" });
    
        if (slot.status === "booked")
        return res.status(200).json({ msg: "Slot already booked" });
    
        if (slot.status === "pending")
        return res.status(200).json({ msg: "Slot already pending" });
    
        const updatedSlot = await Slot.findByIdAndUpdate(
        slotId,
        { status: "pending", updatedAt: Date.now(), user: req.userId },
        { new: true }
        );
        
        const admins = await adminModel.find();
        const upiId = admins[0].upiId;
        const qrCode = admins[0].qrCode;
        return res
        .status(200)
        .json({ msg: "Please complete payment", slot: updatedSlot, upiId, qrCode });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Internal server error", error: error });
    }
}

routes.confirmSlot = async (req, res) => {
    try {
        const { slotId, referenceNumber, name } = req.body;
    
        const slot = await Slot.findById(slotId);
    
        if (!slot) return res.status(200).json({ msg: "Slot not found" });
    
        if (slot.status === "booked")
        return res.status(200).json({ msg: "Slot already booked" });
    
        if (slot.status === "available")
        return res.status(200).json({ msg: "Slot is not booked. Contact Gajab momos" });
    
        const updatedSlot = await Slot.findByIdAndUpdate(
        slotId,
        { user: req.userId, paymentBy: name , paymentReferenceNumber: referenceNumber, updatedAt: Date.now() },
        { new: true }
        );
    
        return res.status(200).json({ msg: "Slot booked successfully", slot: updatedSlot });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Internal server error", error: error });
    }
}

routes.cancelSlot = async (req, res) => {
    try {
        const { slotId } = req.body;
    
        const slot = await Slot.findById(slotId);
    
        if (!slot) return res.status(200).json({ msg: "Slot not found" });
    
        if (slot.status === "booked")
        return res.status(200).json({ msg: "Slot is not booked. Contact Gajab momos" });

        if (slot?.paymentReferenceNumber && slot?.paymentBy){
            return res.status(200).json({ msg: "Slot is booked. Contact Gajab momos" });
        }
    
        const updatedSlot = await Slot.findByIdAndUpdate(
        slotId,
        { user: null, paymentBy: null , paymentReferenceNumber: null, status: "available", updatedAt: Date.now() },
        { new: true }
        );
    
        return res.status(200).json({ msg: "Slot cancelled successfully", slot: updatedSlot });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Internal server error", error: error });
    }
}

routes.myBookings = async (req, res) => {
    try {
        const bookings = await Slot.find({ user: req.userId });
    
        return res
        .status(200)
        .json({ msg: "Bookings fetched successfully", bookings });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Internal server error", error: error });
    }
}

module.exports = routes;