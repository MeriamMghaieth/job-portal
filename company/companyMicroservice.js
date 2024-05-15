const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Company = require('./company');
const connectDB = require('../database');

const PROTO_PATH = __dirname + '/company.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const companyProto = grpc.loadPackageDefinition(packageDefinition).company;

const server = new grpc.Server();

// Connect to MongoDB
connectDB();

server.addService(companyProto.CompanyService.service, {
  GetCompany: async (call, callback) => {
    try {
      const company = await Company.findById(call.request.id);
      if (!company) {
        return callback(new Error('Company not found'));
      }
      callback(null, { id: company.id, name: company.name, location: company.location });
    } catch (err) {
      callback(err);
    }
  },
  CreateCompany: async (call, callback) => {
    try {
      const newCompany = new Company({ name: call.request.name, location: call.request.location });
      const company = await newCompany.save();
      callback(null, { id: company.id, name: company.name, location: company.location });
    } catch (err) {
      callback(err);
    }
  },
  UpdateCompany: async (call, callback) => {
    try {
      const company = await Company.findByIdAndUpdate(call.request.id, { name: call.request.name, location: call.request.location }, { new: true });
      if (!company) {
        return callback(new Error('Company not found'));
      }
      callback(null, { id: company.id, name: company.name, location: company.location });
    } catch (err) {
      callback(err);
    }
  },
  DeleteCompany: async (call, callback) => {
    try {
      const company = await Company.findByIdAndDelete(call.request.id);
      if (!company) {
        return callback(new Error('Company not found'));
      }
      callback(null, { id: company.id, name: company.name, location: company.location });
    } catch (err) {
      callback(err);
    }
  },
});

server.bindAsync('localhost:50052', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Company gRPC service running at localhost:50052');
  server.start();
});
