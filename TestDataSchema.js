const mongoose = require ("mongoose");

// Define patient clinical data
const dataSchema = new mongoose.Schema({
    patient_id: String,
    date_time: Date,
    data_type: String,
    reading_value: String,
    condition: String,
});

// Compiles the schema into a model, opening (or creating, if
// nonexistent) the 'TestData' collection in the MongoDB database
module.exports = mongoose.model('TestData', dataSchema);