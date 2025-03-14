const mongoose = require('mongoose');

const academicCalendarSchema = new mongoose.Schema({
  academicYear: { type: String, required: true, unique: true }, // e.g. "2022-2023"
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  yearAdvancementDate: { type: Date, required: true }, // When students move to next year (typically May)
  terms: [{
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  }],
  holidays: [{
    name: { type: String },
    date: { type: Date },
    description: { type: String }
  }]
});