let SERVER_NAME = 'patient-data-api'
let PORT = 3000;
let HOST = '127.0.0.1';

const mongoose = require ("mongoose");
const username = "group7_admin";
const password = "8kWON0SkJDJSDg9e";
const dbname = "mapd713_group7_db";

// Atlas MongoDb connection string format
let uristring = 'mongodb+srv://'+username+':'+password+'@cluster0.w4uxyix.mongodb.net/'+dbname+
'?retryWrites=true&w=majority';
console.log(uristring)

// Makes db connection asynchronously
mongoose.connect(uristring, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', ()=>{
  // we're connected!
  console.log("!!!! Connected to db: " + uristring)
});

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

// Compiles the schema into a model, opening (or creating, if
// nonexistent) the 'Patient' collection in the MongoDB database
let PatientsModel = mongoose.model('Patients', patientSchema);
const TestData = require('./TestDataSchema');
let errors = require('restify-errors');
let restify = require('restify')

, server = restify.createServer({name: SERVER_NAME})

server.listen(PORT, HOST, function () {
    console.log('Server %s listening at %s', server.name, server.url)
    console.log('**** Resources: ****')
    console.log('********************')
    console.log(' /patients')
    console.log(' /patients/:id')
    console.log(' /patients/testdata')
    console.log(' /patients/:id/testdata')
    console.log(' /patients/testdata/:id')
})

server.use(restify.plugins.fullResponse());
server.use(restify.plugins.bodyParser());
// Add query parser middleware
server.use(restify.plugins.queryParser());

// Use Case List all Patients Info and Filter Patient by first name & last name
// Get all patients or by filter in the system
server.get('/patients', function (req, res, next) {
    console.log('GET /patients params=>' + JSON.stringify(req.params));

    const first_name = req.query.first_name
    const last_name = req.query.last_name

  // Prepare the filter object
  const filter = {};

  if (first_name) {
    // Filter by first name if provided
    filter.first_name = first_name; 
  }

  if (last_name) {
    // Filter by last name if provided
    filter.last_name = last_name; 
  }
  console.log(filter)

  // Find every entity or filtered entity in db 
    PatientsModel.find(filter)
    .then((patients)=>{
        // Return all of the patients in the system
        res.send(patients);
        return next();
    })
    .catch((error)=>{
        return next(new Error(JSON.stringify(error.errors)));
    });

})

// Use Case View Specific Patient Info
// Get a single patient by their id
server.get('/patients/:id', function (req, res, next) {
    console.log('GET /patients/:id params=>' + JSON.stringify(req.params));

  // Find a single patient by their id in db
  PatientsModel.findOne({ _id: req.params.id })
    .then((patient)=>{
      console.log("found patient: " + patient);
      if (patient) {
        // Send the patient if no issues
        res.send(patient)
      } else {
        // Send 404 header if the patient doesn't exist
        res.send(404)
      }
      return next();
    })
    .catch((error)=>{
        console.log("error: " + error);
        return next(new Error(JSON.stringify(error.errors)));
    });

})

// Use Case Add Patient Info
// Create a new patient
server.post('/patients', function (req, res, next) {
    console.log('POST /patients params=>' + JSON.stringify(req.params));
    console.log('POST /patients body=>' + JSON.stringify(req.body));

    // validation of manditory fields
    if (req.body.first_name === undefined ) {
        // If there are any errors, pass them to next in the correct format
        return next(new errors.BadRequestError('first name must be supplied'))
    }  
    if (req.body.last_name === undefined ) {
        // If there are any errors, pass them to next in the correct format
        return next(new errors.BadRequestError('last name must be supplied'))
    }
    if (req.body.address === undefined ) {
        // If there are any errors, pass them to next in the correct format
        return next(new errors.BadRequestError('address must be supplied'))
    }
    if (req.body.date_of_birth === undefined ) {
        // If there are any errors, pass them to next in the correct format
        return next(new errors.BadRequestError('date of birth must be supplied'))
    }
    if (req.body.gender === undefined ) {
        // If there are any errors, pass them to next in the correct format
        return next(new errors.BadRequestError('gender must be supplied'))
    }
    if (req.body.department === undefined ) {
        // If there are any errors, pass them to next in the correct format
        return next(new errors.BadRequestError('department must be supplied'))
    }
    if (req.body.doctor === undefined ) {
        // If there are any errors, pass them to next in the correct format
        return next(new errors.BadRequestError('doctor must be supplied'))
    }

    let newPatient = new PatientsModel({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        address: req.body.address,
        date_of_birth: req.body.date_of_birth,
        gender: req.body.gender,
        department: req.body.department,
        doctor: req.body.doctor,
        additional_notes: req.body.additional_notes,
        condition: "",
    })

    // Create the patient and save to db
    newPatient.save()
    .then((patient)=> {
      console.log("saved patient: " + patient);
      // Send the patient if no issues
      res.send(201, patient);
      return next();
    })
    .catch((error)=>{
      console.log("error: " + error);
      return next(new Error(JSON.stringify(error.errors)));
  });
})

// Use Case Edit Patients’ Basic Information
// Edit one patients' record
// Update a patient by their id
server.patch('/patients/:id', function (req, res, next) {
  console.log('PATCH /patients params=>' + JSON.stringify(req.params));
  console.log('PATCH /patients body=>' + JSON.stringify(req.body));

  const patientId = req.params.id;
  const updatedData = req.body

  const updatedPatient = async () =>{

  try {
    // Find the patient by ID and update the data
    
      const updatedPatientData = await PatientsModel.findOneAndUpdate(
      { _id: patientId },
      { $set: updatedData },
      { new: true }
    )

    if (!updatedPatientData) {
      res.send(400)
      return next(new Error('Patient not found'));
    }

    // Return the updated patient as the response
    res.send(200, updatedPatientData);
  }
  catch (error) {
    // Handle any errors that occur during the update process
    res.send(500)
    console.log("error: " + error);
    return next(new Error(JSON.stringify(error.errors)));
  }
}
  updatedPatient()
})

// View Patients with Critical Condition
server.get('/patients/critical', function (req, res, next) {
  console.log('GET /patients params=>' + JSON.stringify(req.params));

// Find every entity with critical condition in db
  PatientsModel.find({ condition: "critical" })
  .then((patients)=>{
      // Return all of the patients with critical condition in the system
      res.send(patients);
      return next();
  })
  .catch((error)=>{
      return next(new Error(JSON.stringify(error.errors)));
  });

})

// Use Case: Delete Specific Patient’s Basic Information Record and All of its Respective Clinical Data
// Delete Specific Patient by ID
server.del('/patients/:id', function (req, res, next) {
  console.log('DELETE /patients params=>' + JSON.stringify(req.params));
  // Delete the patient in db
  PatientsModel.findOneAndDelete({ _id: req.params.id })
    .then((deletePatient)=>{      
      console.log("deleted patient: " + deletePatient);
      if(deletePatient){
        res.send(200, "deleted patient with id: " + req.params.id);
      } else {
        res.send(404, "Patient not found");
      }      
      return next();
    })
    .catch((error)=>{
      console.log("error: " + error);
      return next(new Error(JSON.stringify(error.errors)));
    });
})

// Test Data Use Cases
// Create new Test Data
server.post('/patients/testdata', function (req, res, next) {
  console.log('POST /patients params=>' + JSON.stringify(req.params));
  console.log('POST /patients body=>' + JSON.stringify(req.body));

  let newTestData = new TestData({
    patient_id: req.body.patient_id,
    date_time: req.body.date_time,
    data_type: req.body.data_type,
    reading_value: req.body.reading_value,
    condition: ""
  })

  // Create the testdata and save to db
  newTestData.save()
  .then((testdata)=> {
    console.log("saved test data: " + testdata);
    // Send the testdata if no issues
    res.send(201, testdata);
    return next();
  })
  .catch((error)=>{
    console.log("error: " + error);
    return next(new Error(JSON.stringify(error.errors)));
  });
})

// Get all Test Data for a specific patient
server.get('/patients/:id/testdata', function(req, res, next) {
  console.log('GET /patients/:id/testdata params=>' + JSON.stringify(req.params));

  TestData.find({ patient_id: req.params.id })
  .then((testdata)=>{
    console.log("found test data for patient: " + testdata);
    if (testdata) {
      // Send the testdatas if no issues
      res.send(testdata)
    } else {
      // Send 404 header if the patient doesn't exist
      res.send(404)
    }
    return next();
  })
  .catch((error)=>{
      console.log("error: " + error);
      return next(new Error(JSON.stringify(error.errors)));
  });
})

// Use Case: Delete Specific Patient’s Basic Information Record and All of its Respective Clinical Data
// Delete all Test Data for a specific patient
server.del('/patients/:id/testdata', function(req, res, next) {
  console.log('DELETE /patients/:id/testdata params=>' + JSON.stringify(req.params));

  TestData.deleteMany({ patient_id: req.params.id })
  .then((deletedTestData)=>{      
    console.log("deleted Test Data: " + deletedTestData);
    if(deletedTestData){
      res.send(200, deletedTestData);
    }     
    return next();
  })
  .catch(()=>{
    console.log("error: " + error);
    return next(new Error(JSON.stringify(error.errors)));
  });
})


// Update Test Data by id
server.patch('/patients/testdata/:id', function(req, res, next) {
  console.log('PATCH /patients/testdata/:id params=>' + JSON.stringify(req.params));
  
  const updatedData = req.body
  console.log(req.body)
  const testDateID = req.params.id
  
  const updateDoc = async () => {
    try {
      const testDataUp = await TestData.findByIdAndUpdate(
        { _id: testDateID },
        { $set: updatedData },
        { new: true }
        );

      if (!testDataUp) {
        return res.send(404, 'Test Data not found');
      }
    
      console.log("Updated test data to " + testDataUp)
      res.send(testDataUp);
    } catch (error) {
      console.log(error);
    }
  }

  updateDoc()
})

// Delete Test Data by id
server.del('/patients/testdata/:id', function(req, res, next) {
  console.log('DELETE /patients/testdata/:id params=>' + JSON.stringify(req.params));

  const deleteDoc = async (id) => {
    try {
      const testDataDel = await TestData.findByIdAndDelete(id);

      if (!testDataDel) {
        return res.send(404, 'Test Data Deleted');
      }
      console.log("Deleted test data")
      res.send(200, "Deleted test data with id: " + id);
    } catch (error) {
      console.log(error);
    }
  }
  deleteDoc(req.params.id)
})