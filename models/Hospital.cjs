const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  language: {
    type: String,
    default: "EN"
  },
  htitle: {
    type: String,
    default: "Psychology & Wellness Centers"
  },
  hsubtitle: {
    type: String,
    default: "Our Partner Clinics",
  },
  hdesc: {
    type: String,
    default: "Explore our network of specialized clinical psychology centers and mental health clinics offering world-class therapeutic facilities."
  },
  name: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  specialties: [{
    type: String,
    trim: true
  }],
  treatments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HospitalTreatment'
  }],
  rating: {
    type: Number,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  beds: {
    type: Number,
    min: [0, 'Beds cannot be negative']
  },
  accreditation: [{
    type: String,
    trim: true
  }],
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  blurb: {
    type: String,
    required: [true, 'Blurb is required'],
    maxlength: [500, 'Blurb cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
hospitalSchema.index({ country: 1, city: 1 });
hospitalSchema.index({ rating: -1 });
hospitalSchema.index({ specialties: 1 });

module.exports = mongoose.model('Hospital11', hospitalSchema);