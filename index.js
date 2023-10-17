let SERVER_NAME = 'patient-data-api'
let PORT = 3000;
let HOST = '127.0.0.1';

let errors = require('restify-errors');
let restify = require('restify')

, patientSave = require('save')('patients')

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

    // Find every entity within the given collection
    patientSave.find({}, function (error,patients) {
        // Return all patients in the system
        res.send(patients)
    })
})

// Use Case View Specific Patient Info
// Get a single patient by their id
server.get('/patients/:id', function (req, res, next) {
    console.log('GET /patients/:id params=>' + JSON.stringify(req.params));

    // Find a patient by their id within save
    patientSave.findOne({_id: req.params.id }, function (error, patient) {

        // If there are any error, pass them to next in the correct format
        if (error) return next(new Error(JSON.stringify(error.errors)))

        if (patient) {
            // Send patient if no issues
            res.send(patient)
        }
        else {
            // Send 404 header if the user doesn't exist
            res.send(404)
        }
    })
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

    let newPatient = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        address: req.body.address,
        date_of_birth: req.body.date_of_birth,
        gender: req.body.gender,
        department: req.body.department,
        doctor: req.body.doctor,
        clinical_data: [{}]
    }

    // Create new patient using the persistence engine
    patientSave.create(newPatient, function (error, patient) {
        // If there are any errors, pass them to next in the correct format
        if (error) return next(new Error(JSON.stringify(error.errors)))

        // Send the patient if no issues
        res.send(201, patient)
    })
})