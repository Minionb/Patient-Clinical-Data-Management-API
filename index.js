let SERVER_NAME = 'patient-data-api'
let PORT = 3000;
let HOST = '127.9.9.1';

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