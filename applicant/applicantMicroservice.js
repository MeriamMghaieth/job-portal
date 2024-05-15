const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Applicant = require('./applicant');
const connectDB = require('../database');

const PROTO_PATH = __dirname + '/applicant.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const applicantProto = grpc.loadPackageDefinition(packageDefinition).applicant;

const server = new grpc.Server();

// Connect to MongoDB
connectDB();

server.addService(applicantProto.ApplicantService.service, {
  GetApplicant: async (call, callback) => {
    try {
      const applicant = await Applicant.findById(call.request.id);
      if (!applicant) {
        return callback(new Error('Applicant not found'));
      }
      callback(null, { id: applicant.id, name: applicant.name, resume: applicant.resume });
    } catch (err) {
      callback(err);
    }
  },
  CreateApplicant: async (call, callback) => {
    try {
      const newApplicant = new Applicant({ name: call.request.name, resume: call.request.resume });
      const applicant = await newApplicant.save();
      callback(null, { id: applicant.id, name: applicant.name, resume: applicant.resume });
    } catch (err) {
      callback(err);
    }
  },
  UpdateApplicant: async (call, callback) => {
    try {
      const applicant = await Applicant.findByIdAndUpdate(call.request.id, { name: call.request.name, resume: call.request.resume }, { new: true });
      if (!applicant) {
        return callback(new Error('Applicant not found'));
      }
      callback(null, { id: applicant.id, name: applicant.name, resume: applicant.resume });
    } catch (err) {
      callback(err);
    }
  },
  DeleteApplicant: async (call, callback) => {
    try {
      const applicant = await Applicant.findByIdAndDelete(call.request.id);
      if (!applicant) {
        return callback(new Error('Applicant not found'));
      }
      callback(null, { id: applicant.id, name: applicant.name, resume: applicant.resume });
    } catch (err) {
      callback(err);
    }
  },
});

server.bindAsync('localhost:50053', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Applicant gRPC service running at localhost:50053');
  server.start();
});
