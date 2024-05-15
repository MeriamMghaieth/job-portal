const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Application = require('./application');
const connectDB = require('../database');

const PROTO_PATH = __dirname + '/application.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const applicationProto = grpc.loadPackageDefinition(packageDefinition).application;

const server = new grpc.Server();

// Connect to MongoDB
connectDB();

server.addService(applicationProto.ApplicationService.service, {
  GetApplication: async (call, callback) => {
    try {
      const application = await Application.findById(call.request.id);
      if (!application) {
        return callback(new Error('Application not found'));
      }
      callback(null, { id: application.id, jobId: application.jobId, applicantId: application.applicantId, status: application.status });
    } catch (err) {
      callback(err);
    }
  },
  CreateApplication: async (call, callback) => {
    try {
      const newApplication = new Application({ jobId: call.request.jobId, applicantId: call.request.applicantId, status: call.request.status });
      const application = await newApplication.save();
      callback(null, { id: application.id, jobId: application.jobId, applicantId: application.applicantId, status: application.status });
    } catch (err) {
      callback(err);
    }
  },
  UpdateApplication: async (call, callback) => {
    try {
      const application = await Application.findByIdAndUpdate(call.request.id, { jobId: call.request.jobId, applicantId: call.request.applicantId, status: call.request.status }, { new: true });
      if (!application) {
        return callback(new Error('Application not found'));
      }
      callback(null, { id: application.id, jobId: application.jobId, applicantId: application.applicantId, status: application.status });
    } catch (err) {
      callback(err);
    }
  },
  DeleteApplication: async (call, callback) => {
    try {
      const application = await Application.findByIdAndDelete(call.request.id);
      if (!application) {
        return callback(new Error('Application not found'));
      }
      callback(null, { id: application.id, jobId: application.jobId, applicantId: application.applicantId, status: application.status });
    } catch (err) {
      callback(err);
    }
  },
});

server.bindAsync('localhost:50054', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Application gRPC service running at localhost:50054');
  server.start();
});
