const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const feedbackSchema = new mongoose.Schema({
    student: { type: ObjectId, ref:'student' },
    title: {type:String, required: true},
    desciption: {type: String, required: true}
});

const feedbackSchemaModel = mongoose.model('feedback', feedbackSchema);

module.exports = feedbackSchemaModel;