const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const academicAdvisorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  rawPassword: {
    type: String,
    select: false // Hide raw password from queries by default
  },
  registerNo: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['advisor', 'hod'],
    default: 'advisor'
  },
  assignedClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  department: {
    type: String,
    required: true
  },
  profileImg: {
    type: String
  }
});

// Password hashing middleware
academicAdvisorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
academicAdvisorSchema.methods.comparePassword = async function(password) {
  try {
    const result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

const AcademicAdvisor = mongoose.model('AcademicAdvisor', academicAdvisorSchema);
module.exports = AcademicAdvisor; 