const { validateEmergencyRequest, EmergencyRequest } = require("../models/EmergencyRequest");
const auth = require("../middlewares/auth");

const mongoose = require("mongoose");
const router = require("express").Router();

// create  EmergencyRequest.
router.post("/contact", auth, async (req, res) => {
  const { error } = validateEmergencyRequest(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { emergencytype, name,age,vehicleName,locationDetails,damageStories, mainRequest,passengersRequests,  email, phone } = req.body;

  try {
    const newEmergencyRequest = new EmergencyRequest({
      emergencytype,
      name,
      age,
      vehicleName,
      locationDetails,
      damageStories,
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
  
  const { id } = validateEmergencyRequest(req.body);

  if (!id) return res.status(400).json({ error: "no id specified." });
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "please enter a valid id" });

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
