let SERVER_NAME = 'patient-data-api'
let PORT = process.env.PORT || 3000;
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

// Compiles the schema into a model, opening (or creating, if
// nonexistent) the 'Patient' collection in the MongoDB database
const PatientsModel = require('./PatientSchema');
const TestData = require('./TestDataSchema');
let errors = require('restify-errors');
let restify = require('restify')

, server = restify.createServer({name: SERVER_NAME})

server.listen(PORT, function () {
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

// Use Case List all Patients Info and Filter Patient by first name & last name or condition
// Get all patients or by filter in the system
server.get('/patients', function (req, res, next) {
    console.log('GET /patients params=>' + JSON.stringify(req.params));

    const first_name = req.query.first_name
    const last_name = req.query.last_name
    const condition = req.query.condition

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

  if (condition) {
    // Filter by condition if provided
    filter.condition = condition; 
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
        condition: "no records",
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
// Delete Specific Patient by ID and the relative test data
server.del('/patients/:id', function (req, res, next) {
  console.log('DELETE /patients params=>' + JSON.stringify(req.params));

  Promise.all([
    PatientsModel.findOneAndDelete({ _id: req.params.id }),
    TestData.deleteMany({ patient_id: req.params.id })
  ])
    .then(([deletedPatient, deletedTestData]) => {
      console.log("deleted patient: " + deletedPatient);
      console.log("deleted test data: " + deletedTestData);

      if (deletedPatient) {
        res.send(200, "Deleted patient with id: " + req.params.id + " and the relative test data." );
      } else {
        res.send(404,"Patient not found");
      }
    })
    .catch((error) => {
      console.log("error: " + error);
      res.send(500, "Error deleting patient and the relative test data: " + error.message);
    })
    .finally(() => {
      return next();
    });
});

// Test Data Use Cases
// Create new Test Data
server.post('/patients/testdata', function (req, res, next) {
  console.log('POST /patients params=>' + JSON.stringify(req.params));
  console.log('POST /patients body=>' + JSON.stringify(req.body));
  let condition;

  switch (req.body.data_type) {
    case 'Blood Pressure':
      var bloodPressure = req.body.reading_value.split("/");
      bloodPressure[1] = bloodPressure[1].split(" ")[0];
      bloodPressure[0] = parseInt(bloodPressure[0], 10);
      bloodPressure[1] = parseInt(bloodPressure[1], 10);

      if (bloodPressure[0] >= 180 || bloodPressure[1] >= 120) {
        condition = "critical";
      } else if (bloodPressure[0] >= 140 || bloodPressure[1] >= 90) {
        condition = "bad";
      } else if (140 > bloodPressure[0] && bloodPressure[0] >= 130 && 90 > bloodPressure[1] && bloodPressure[1] >= 80) {
        condition = "average";
      } else if (130 > bloodPressure[0] && bloodPressure[0] >= 120 && bloodPressure[1] > 80) {
        condition = "fine";
      } else {
        condition = "good";
      }
      break;
  
    case 'Respiratory Rate':
      var respiratoryRate = req.body.reading_value.split("/");
      respiratoryRate = parseInt(respiratoryRate[0]);

      if (respiratoryRate > 24) {
        condition = "critical";
      } else if (respiratoryRate > 20) {
        condition = "average";
      } else if (20 >= respiratoryRate && respiratoryRate >= 12) {
        condition = "good";
      }
      break;
  
    case 'Blood Oxygen Level':
      var bloodOxygenLevel = req.body.reading_value.split(" ");
      bloodOxygenLevel = parseInt(bloodOxygenLevel[0]);

      if (bloodOxygenLevel <= 67) {
        condition = "critical";
      } else if (bloodOxygenLevel <= 85) {
        condition = "bad";
      } else if (bloodOxygenLevel <= 90) {
        condition = "average";
      } else if (bloodOxygenLevel <= 95) {
        condition = "fine";
      } else {
        condition = "good";
      }
      break;
  
    case 'Heartbeat Rate':
      var bpm = req.body.reading_value.split(" ");
      bpm = parseInt(bpm[0]);
      
      if (48 <= bpm && bpm <= 61) {
        condition = "good";
      } else if (62 <= bpm && bpm <= 69) {
        condition = "fine";
      } else if (70 <= bpm && bpm <= 73) {
        condition = "average";
      } else if (74 <= bpm && bpm <= 79) {
        condition = "bad";
      } else if (80 <= bpm) {
        condition = "critical";
      }
      break;
  
    default:
      // Handle the default case if needed
      break;
  }

  let newTestData = new TestData({
    patient_id: req.body.patient_id,
    date_time: req.body.date_time,
    data_type: req.body.data_type,
    reading_value: req.body.reading_value,
    condition: condition,
    isLatest: true,
  })

  // Create the testdata and save to db

  // Update isLatest to false for all records of the specific data type
  newTestData.save()
  .then((testdata) => {
    console.log("saved test data: " + testdata);

    // Update isLatest to false for all records of the specific data type
    return TestData.updateMany({ patient_id: req.body.patient_id, data_type: req.body.data_type }, { $set: { isLatest: false } })
      .then(() => {
        // Find the latest record and update isLatest to true
        return TestData.findOneAndUpdate(
          {  patient_id: req.body.patient_id, data_type: req.body.data_type },
          { $set: { isLatest: true } },
          { sort: { date_time: -1 } }
        )
          .then((updatedRecord) => {
            if (updatedRecord) {
              console.log('Latest record updated:', updatedRecord);
            } else {
              console.log('No records found');
            }
            // Continue to the next operation
            return TestData.find({ patient_id: req.body.patient_id, isLatest: true });
          })
      })
  })
  .then((records) => {
    let patientCondition = "no records"; // Assume initial condition is ""

    // Iterate over the records and compare conditions
    records.forEach((record) => {
      console.log(record);
      if (record.condition === "critical") {
        patientCondition = "critical";
      } else if (record.condition === "bad" && patientCondition !== "critical") {
        patientCondition = "bad";
      } else if (record.condition === "average" && patientCondition !== "critical" && patientCondition !== "bad") {
        patientCondition = "average";
      } else if (record.condition === "fine" && patientCondition !== "critical" && patientCondition !== "bad" && patientCondition !== "average") {
        patientCondition = "fine";
      } else if (record.condition === "good" && patientCondition !== "critical" && patientCondition !== "bad" && patientCondition !== "average" && patientCondition !== "fine") {
        patientCondition = "good";
      }
    });

    console.log("Patient condition: " + patientCondition);

    // Update the patient's condition in the patientSchema
    return PatientsModel.findOneAndUpdate(
      { _id: req.body.patient_id }, 
      { condition: patientCondition }, 
      { new: true });
  })
  .then((updatedPatient) => {
    console.log("Patient condition updated successfully: " + updatedPatient.condition);
    res.send(201, newTestData)
  })
  .catch((error) => {
    console.error(error);
    res.send(500, 'Internal Server Error')
  });
});

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
  const testDataID = req.params.id

  let condition;

  switch (req.body.data_type) {
    case 'Blood Pressure':
      var bloodPressure = req.body.reading_value.split("/");
      bloodPressure[1] = bloodPressure[1].split(" ")[0];
      bloodPressure[0] = parseInt(bloodPressure[0], 10);
      bloodPressure[1] = parseInt(bloodPressure[1], 10);

      if (bloodPressure[0] >= 180 || bloodPressure[1] >= 120) {
        condition = "critical";
      } else if (bloodPressure[0] >= 140 || bloodPressure[1] >= 90) {
        condition = "bad";
      } else if (140 > bloodPressure[0] && bloodPressure[0] >= 130 && 90 > bloodPressure[1] && bloodPressure[1] >= 80) {
        condition = "average";
      } else if (130 > bloodPressure[0] && bloodPressure[0] >= 120 && bloodPressure[1] > 80) {
        condition = "fine";
      } else {
        condition = "good";
      }
      break;
  
    case 'Respiratory Rate':
      var respiratoryRate = req.body.reading_value.split("/");
      respiratoryRate = parseInt(respiratoryRate[0]);

      if (respiratoryRate > 24) {
        condition = "critical";
      } else if (respiratoryRate > 20) {
        condition = "average";
      } else if (20 >= respiratoryRate && respiratoryRate >= 12) {
        condition = "good";
      }
      break;
  
    case 'Blood Oxygen Level':
      var bloodOxygenLevel = req.body.reading_value.split(" ");
      bloodOxygenLevel = parseInt(bloodOxygenLevel[0]);

      if (bloodOxygenLevel <= 67) {
        condition = "critical";
      } else if (bloodOxygenLevel <= 85) {
        condition = "bad";
      } else if (bloodOxygenLevel <= 90) {
        condition = "average";
      } else if (bloodOxygenLevel <= 95) {
        condition = "fine";
      } else {
        condition = "good";
      }
      break;
  
    case 'Heartbeat Rate':
      var bpm = req.body.reading_value.split(" ");
      bpm = parseInt(bpm[0]);
      
      if (48 <= bpm && bpm <= 61) {
        condition = "good";
      } else if (62 <= bpm && bpm <= 69) {
        condition = "fine";
      } else if (70 <= bpm && bpm <= 73) {
        condition = "average";
      } else if (74 <= bpm && bpm <= 79) {
        condition = "bad";
      } else if (80 <= bpm) {
        condition = "critical";
      }
      break;
  
    default:
      // Handle the default case if needed
      break;
  }

  updatedData.condition = condition

  
  const updateDoc = async () => {
    try {
      const testDataUp = await TestData.findByIdAndUpdate(
        { _id: testDataID },
        { $set: updatedData },
        { new: true }
      );
  
      if (!testDataUp) {
        return res.status(404).send('Test Data not found');
      }
    
      console.log("Updated test data to " + testDataUp);
  
      return TestData.updateMany({ patient_id: req.body.patient_id, data_type: req.body.data_type }, { $set: { isLatest: false } })
        .then(() => {
          // Find the latest record and update isLatest to true
          return TestData.findOneAndUpdate(
            {  patient_id: req.body.patient_id, data_type: req.body.data_type },
            { $set: { isLatest: true } },
            { sort: { date_time: -1 } }
          )
            .then((updatedRecord) => {
              if (updatedRecord) {
                console.log('Latest record updated:', updatedRecord);
              } else {
                console.log('No records found');
              }
              // Continue to the next operation
              return TestData.find({ patient_id: req.body.patient_id, isLatest: true });
            })
        })
        .then((records) => {
          let patientCondition = "no records"; // Assume initial condition is ""
      
          // Iterate over the records and compare conditions
          records.forEach((record) => {
            console.log(record);
            if (record.condition === "critical") {
              patientCondition = "critical";
            } else if (record.condition === "bad" && patientCondition !== "critical") {
              patientCondition = "bad";
            } else if (record.condition === "average" && patientCondition !== "critical" && patientCondition !== "bad") {
              patientCondition = "average";
            } else if (record.condition === "fine" && patientCondition !== "critical" && patientCondition !== "bad" && patientCondition !== "average") {
              patientCondition = "fine";
            } else if (record.condition === "good" && patientCondition !== "critical" && patientCondition !== "bad" && patientCondition !== "average" && patientCondition !== "fine") {
              patientCondition = "good";
            }
          });
      
          console.log("Patient condition: " + patientCondition);
      
          // Update the patient's condition in the patientSchema
          return PatientsModel.findOneAndUpdate(
            { _id: req.body.patient_id }, 
            { condition: patientCondition }, 
            { new: true });
        })
        .then((updatedPatient) => {
          console.log("Patient condition updated successfully: " + updatedPatient.condition);
          res.send(201,testDataUp)
        })
        .catch((error) => {
          console.error(error);
          res.send(500,'Internal Server Error');
        });
    } catch (error) {
      console.log(error);
      res.send(500,'Internal Server Error');
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
  // Update the isLatest field for the remaining records
  await TestData.updateMany(
    { patient_id: testDataDel.patient_id, data_type: testDataDel.data_type },
    { $set: { isLatest: false } }
  );

  // Find the latest record and update isLatest to true
  const updatedRecord = await TestData.findOneAndUpdate(
    { patient_id: testDataDel.patient_id, data_type: testDataDel.data_type },
    { $set: { isLatest: true } },
    { sort: { date_time: -1 } }
  );

  if (updatedRecord) {
    console.log('Latest record updated:', updatedRecord);
  } else {
    console.log('No records found');
  }

  // Retrieve the records with isLatest set to true
  const records = await TestData.find({ patient_id: testDataDel.patient_id, isLatest: true });

  let patientCondition = "no records"; // Assume initial condition is ""

  // Iterate over the records and compare conditions
  records.forEach((record) => {
    console.log(record);
    if (record.condition === "critical") {
      patientCondition = "critical";
    } else if (record.condition === "bad" && patientCondition !== "critical") {
      patientCondition = "bad";
    } else if (record.condition === "average" && patientCondition !== "critical" && patientCondition !== "bad") {
      patientCondition = "average";
    } else if (record.condition === "fine" && patientCondition !== "critical" && patientCondition !== "bad" && patientCondition !== "average") {
      patientCondition = "fine";
    } else if (record.condition === "good" && patientCondition !== "critical" && patientCondition !== "bad" && patientCondition !== "average" && patientCondition !== "fine") {
      patientCondition = "good";
    }
  });

  console.log("Patient condition: " + patientCondition);

  // Update the patient's condition in the patientSchema
  const updatedPatient = await PatientsModel.findOneAndUpdate(
    { _id: testDataDel.patient_id },
    { condition: patientCondition },
    { new: true }
  );

  console.log("Patient condition updated successfully: " + updatedPatient.condition);

  res.send(200, "Deleted test data with id: " + id)
  } catch (error) {
  console.error(error);
  res.send(500,'Internal Server Error');
  }
  }
  deleteDoc(req.params.id)
})