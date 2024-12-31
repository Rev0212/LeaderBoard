const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const classSchema = new mongoose.Schema({
    className: { type: String, required: true, unique: true },
    teacher: {
      type: ObjectId,
      ref: 'teacher'
    },
    students: [{
      type: ObjectId,
      ref: 'student'
    }]
});

const classModel = mongoose.model('Class', classSchema);

module.exports = classModel;