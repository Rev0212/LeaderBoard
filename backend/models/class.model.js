const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const classSchema = new mongoose.Schema({
    className: { type: String, required: true, unique: false },
    year:{type:Number,require:true,unique:false},
    teacher: {
      type: ObjectId,
      ref: 'teacher'
    },
    students: [{
      type: ObjectId,
      ref: 'student'
    }],
});

const classModel = mongoose.model('Class', classSchema);

module.exports = classModel;