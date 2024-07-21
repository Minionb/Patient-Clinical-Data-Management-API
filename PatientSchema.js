const mongoose = require ("mongoose");

// Define patient collection schema
const patientSchema = new mongoose.Schema({
    first_name: String, 
    last_name: String,
    address: String, 
    date_of_birth: Date,
    gender: String, 
    department: String,
    doctor: String, 
    additional_notes: String,
    condition: String,
});

module.exports = mongoose.model('Patients', patientSchema);