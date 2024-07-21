let chai = require('chai');
let chaiHttp = require('chai-http');
let expect = chai.expect;
chai.use(chaiHttp);

// define base uri for the Patients App under test

// render cloud uri
const uri = 'https://mapd713-project-group7.onrender.com';

// local uri
//const uri = 'http://127.0.0.1:3000';


describe("when we issue a 'GET' to /patients", function(){
    it("should return HTTP 200", function(done) {
        chai.request(uri)
            .get('/patients')
            .end(function(req, res){
                expect(res.status).to.equal(200);
                done();
            });
    });
});

describe("when we issue a 'GET' to /patients", function(){
    it("should return list of patients []", function(done) {
        chai.request(uri)
            .get('/patients')
            .end(function(req, res){
                expect(res.body).to.be.an('array');
                done();
            });
    });
});

describe("when we issue a 'POST' to /patients with patient info", function(){
    it("should return response code 201 with patient created", function(done) {
        chai.request(uri)
            .post('/patients')
            .field('first_name', 'Candy')
            .field('last_name', 'Netham')
            .field('address', 'Downtown')
            .field('date_of_birth', '1950-03-03')
            .field('gender', 'Female')
            .field('department', 'C')
            .field('doctor', 'Dr. Sally')
            .field('additional_notes', '')
            .field('condition', '')
            .end(function(req, res){
                expect(res.status).to.equal(201);
                expect(res.body.first_name).to.equal('Candy')
                expect(res.body).to.be.an('object');
                done();
                
            });
    });


});

describe("when we issue a 'PATCH' to /patients with patient info", function(){
    it("should return response code 200 and updated field when patient is modified", function(done) {
        const testPatientID = "65677453c016eb70a82228fa"
        chai.request(uri)
            .patch(`/patients/${testPatientID}`)
            .field('doctor', 'Dr. Joe')
            .end(function(req, res){
                expect(res.status).to.equal(200);
                expect(res.body.doctor).to.equal('Dr. Joe')
                expect(res.body).to.be.an('object');
                done();
            });
    });
});

describe("when we issue a 'GET' to /patients/:id ", function(){
    it("should return a specific patient", function(done) {
        const testPatientID = "65677453c016eb70a82228fa"
        chai.request(uri)
            .get(`/patients/${testPatientID}`)
            .field('doctor', 'Dr. Joe')
            .end(function(req, res){
                expect(res.status).to.equal(200);
                expect(res.body.doctor).to.equal('Dr. Joe')
                expect(res.body).to.be.an('object');
                done();
            });
    });
});

describe("when we issue a 'GET' to /patients/:id/testdata", function(){
    it("should return HTTP 200", function(done) {
        const testPatientID = "65677453c016eb70a82228fa"
        chai.request(uri)
            .get(`/patients/${testPatientID}/testdata`)
            .end(function(req, res){
                expect(res.status).to.equal(200);
                done();
            });
    });
});

describe("when we issue a 'GET' to /patients/:id/testdata", function(){
    it("should return list of patients' testdate []", function(done) {
        const testPatientID = "65677453c016eb70a82228fa"
        chai.request(uri)
            .get(`/patients/${testPatientID}/testdata`)
            .end(function(req, res){
                expect(res.body).to.be.an('array');
                done();
            });
    });
});


