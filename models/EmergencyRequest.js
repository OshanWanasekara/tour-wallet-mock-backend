const mongoose = require("mongoose");
const Joi = require("joi");

const EmergencyRequestSchema = new mongoose.Schema({
  emergencytype: {
    type: String,
    required: [true, "emergencytype is required."],
    minlength: 2,
    maxlength: 50,   
  },
  name: {
    type: String,
    required: [true, "Name is required."],
    minlength: 4,
    maxlength: 50,
  },
  age: {
    type: Number,
    required: [true, "Age is required."],
    min: [18, "Age must be 18 or older."],
  },
  vehicleName: {
    type: String,
    required: [true, "vehicleName is required."],
    minlength: 7,
    maxlength: 8,
  },
  locationDetails: {
    type: String,
    required: [true, "location details are required."],
  },
  
  mainRequest: {
    type: String,
    required: [true, "main request is required."],
  },
  passengersRequests: {
    type: String,
    required: [true, "passengersRequests are required."],
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    trim: true,
    lowercase: true,
    validate: {
      validator: (value) => {
        // Regular expression for email validation
        return /^\S+@\S+\.\S+$/.test(value);
      },
      message: "Invalid email address.",
    },
  },
  phone: {
    type: String,
    required: [true, "Phone number is required."],
    minlength: 7,
    maxlength: 15,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const EmergencyRequest = mongoose.model("EmergencyRequest", EmergencyRequestSchema);

const validateEmergencyRequest = (data) => {
  const schema = Joi.object({
    emergencytype: Joi.string(),    
    name: Joi.string().min(3).max(50).required(),
    age: Joi.number().min(18).required(),
    vehicleName: Joi.string().min(7).max(8).required(),
    locationDetails: Joi.string().required(),
    mainRequest: Joi.string().required(),
    passengersRequests: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(7).max(15).required(),
  });
 
  return schema.validate(data);
};

module.exports = {
  validateEmergencyRequest,
  EmergencyRequest,
};
