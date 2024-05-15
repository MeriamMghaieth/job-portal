const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Job = require('./job');
const connectDB = require('../database');

const PROTO_PATH = __dirname + '/job.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const jobProto = grpc.loadPackageDefinition(packageDefinition).job;

const server = new grpc.Server();

// Connect to MongoDB
connectDB();

server.addService(jobProto.JobService.service, {
  GetJob: async (call, callback) => {
    try {
      const job = await Job.findById(call.request.id);
      if (!job) {
        return callback(new Error('Job not found'));
      }
      callback(null, { id: job.id, title: job.title, description: job.description, companyId: job.companyId });
    } catch (err) {
      callback(err);
    }
  },
  CreateJob: async (call, callback) => {
    try {
      const newJob = new Job({ title: call.request.title, description: call.request.description, companyId: call.request.companyId });
      const job = await newJob.save();
      callback(null, { id: job.id, title: job.title, description: job.description, companyId: job.companyId });
    } catch (err) {
      callback(err);
    }
  },
  UpdateJob: async (call, callback) => {
    try {
      const job = await Job.findByIdAndUpdate(call.request.id, { title: call.request.title, description: call.request.description, companyId: call.request.companyId }, { new: true });
      if (!job) {
        return callback(new Error('Job not found'));
      }
      callback(null, { id: job.id, title: job.title, description: job.description, companyId: job.companyId });
    } catch (err) {
      callback(err);
    }
  },
  DeleteJob: async (call, callback) => {
    try {
      const job = await Job.findByIdAndDelete(call.request.id);
      if (!job) {
        return callback(new Error('Job not found'));
      }
      callback(null, { id: job.id, title: job.title, description: job.description, companyId: job.companyId });
    } catch (err) {
      callback(err);
    }
  },
});

server.bindAsync('localhost:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Job gRPC service running at localhost:50051');
  server.start();
});
