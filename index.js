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

let errors = require('restify-errors');
let restify = require('restify')

, server = restify.createServer({name: SERVER_NAME})

server.listen(PORT, HOST, function () {
    console.log('Server %s listening at %s', server.name, server.url)
    console.log('**** Resources: ****')
    console.log('********************')
    console.log(' /patients')
    console.log(' /patients/:id')  
})

server.use(restify.plugins.fullResponse());
server.use(restify.plugins.bodyParser());

// Use Case List all Patients Info
// Get all patients in the system
server.get('/patients', function (req, res, next) {
    console.log('GET /patients params=>' + JSON.stringify(req.params));


  // Find every entity in db
    PatientsModel.find({})
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
        condition: ""
    })

    // Create the patient and save to db
    newPatient.save()
  .then((patient)=> {
    console.log("saved user: " + patient);
    // Send the user if no issues
    res.send(201, patient);
    return next();
  })
  .catch((error)=>{
    console.log("error: " + error);
    return next(new Error(JSON.stringify(error.errors)));
});
})