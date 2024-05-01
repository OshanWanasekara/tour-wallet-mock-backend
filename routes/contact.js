const { validateEmergencyRequest, EmergencyRequest } = require("../models/EmergencyRequest");
const auth = require("../middlewares/auth");
const mongoose = require("mongoose");
const router = require("express").Router();
const multer = require('multer')
const path = require('path')


//multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});


const upload = multer({ storage }).single("file");



router.post("/fileUpload", upload, async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            url: req.file.path,
            fileName: req.file.filename
        });
    } catch (error) {
        return res.status(500).json({ success: false, error });
    }
});


// create  EmergencyRequest.
router.post("/contact", auth, async (req, res) => {
  const { error } = validateEmergencyRequest(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { emergencytype, name,age,vehicleName,locationDetails, mainRequest,passengersRequests,email, phone } = req.body;

  try {
    const newEmergencyRequest = new EmergencyRequest({
      emergencytype,
      name,
      age,
      vehicleName,
      locationDetails,
      mainRequest, 
      passengersRequests,
      email,
      phone,
      postedBy: req.user._id,
    });
    const result = await  newEmergencyRequest.save();

    return res.status(201).json({ ...result._doc });
  } catch (err) {
    console.log(err);
  }
});

// fetch contact.
router.get("/mycontacts", auth, async (req, res) => {
  try {
    const myContacts = await EmergencyRequest.find({ postedBy: req.user._id }).populate(
      "postedBy",
      "-password"
    );

    return res.status(200).json({ contacts: myContacts.reverse() });
  } catch (err) {
    console.log(err);
  }
});

// update contact.
router.put("/contact", auth, async (req, res) => {

  const { id, emergencytype, name,age,vehicleName,locationDetails, mainRequest,passengersRequests,  email, phone } = req.body;

  if (!id) return res.status(400).json({ error: "no id specified." });
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "please enter a valid id" });

    //age validation
  if(!age || age < 17 || age > 75) 
  return res.status(400).json({ error: "Invalid parameter : age" });

//phone number validation
  if (!phone || phone.length < 10) {
    return res.status(400).json({ error: "Parameter length must be less than 10 : phone" });
  }

  //vehicle number validation
  if (!vehicleName || vehicleName.length > 7 || vehicleName.length < 7) {
    return res.status(400).json({ error: "Parameter length must be exactly 7 : vehicle" });
}

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const contact = await EmergencyRequest.findOne({ _id: id });

    if (req.user._id.toString() !== contact.postedBy._id.toString())
      return res
        .status(401)
        .json({ error: "you can't edit other people contacts!" });

    const updatedData = { ...req.body, id: undefined };
    const result = await EmergencyRequest.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    return res.status(200).json({ ...result._doc });
  } catch (err) {
    console.log(err);
  }
});

// delete a contact.
router.delete("/delete/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "no id specified." });

  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "please enter a valid id" });
  try {
    const contact = await EmergencyRequest.findOne({ _id: id });
    if (!contact) return res.status(400).json({ error: "no contact found" });

    if (req.user._id.toString() !== contact.postedBy._id.toString())
      return res
        .status(401)
        .json({ error: "you can't delete other people contacts!" });

    const result = await EmergencyRequest.deleteOne({ _id: id });
    const myContacts = await EmergencyRequest.find({ postedBy: req.user._id }).populate(
      "postedBy",
      "-password"
    );

    return res
      .status(200)
      .json({ ...contact._doc, myContacts: myContacts.reverse() });
  } catch (err) {
    console.log(err);
  }
});

// to get a single contact.
router.get("/contact/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "no id specified." });

  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "please enter a valid id" });

  try {
    const contact = await EmergencyRequest.findOne({ _id: id });

    return res.status(200).json({ ...contact._doc });
  } catch (err) {
    console.log(err);
  }
});

 

module.exports = router;
