const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const connectDB = require('./database');
const resolvers = require('./graphql/resolvers');
const typeDefs = require('./graphql/schema');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const sendMessage = require('./kafka/kafkaProducer'); // Ensure correct import

const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());

// Load Protos
const jobProtoPath = __dirname + '/job/job.proto';
const jobPackageDefinition = protoLoader.loadSync(jobProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const jobProto = grpc.loadPackageDefinition(jobPackageDefinition).job;

const jobClient = new jobProto.JobService('localhost:50051', grpc.credentials.createInsecure());

const companyProtoPath = __dirname + '/company/company.proto';
const companyPackageDefinition = protoLoader.loadSync(companyProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const companyProto = grpc.loadPackageDefinition(companyPackageDefinition).company;

const companyClient = new companyProto.CompanyService('localhost:50052', grpc.credentials.createInsecure());

const applicantProtoPath = __dirname + '/applicant/applicant.proto';
const applicantPackageDefinition = protoLoader.loadSync(applicantProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const applicantProto = grpc.loadPackageDefinition(applicantPackageDefinition).applicant;

const applicantClient = new applicantProto.ApplicantService('localhost:50053', grpc.credentials.createInsecure());

const applicationProtoPath = __dirname + '/application/application.proto';
const applicationPackageDefinition = protoLoader.loadSync(applicationProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const applicationProto = grpc.loadPackageDefinition(applicationPackageDefinition).application;

const applicationClient = new applicationProto.ApplicationService('localhost:50054', grpc.credentials.createInsecure());

// REST Endpoints for Job
app.post('/job', (req, res) => {
  jobClient.CreateJob(req.body, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('job-portal-events', `Job created: ${response.title}`);
      res.send(response);
    }
  });
});

app.get('/job/:id', (req, res) => {
  jobClient.GetJob({ id: req.params.id }, (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.send(response);
    }
  });
});

app.put('/job/:id', (req, res) => {
  const updatedJob = { ...req.body, id: req.params.id };
  jobClient.UpdateJob(updatedJob, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('job-portal-events', `Job updated: ${response.title}`);
      res.send(response);
    }
  });
});

app.delete('/job/:id', (req, res) => {
  jobClient.DeleteJob({ id: req.params.id }, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('job-portal-events', `Job deleted: ${response.title}`);
      res.send(response);
    }
  });
});

// REST Endpoints for Company
app.post('/company', (req, res) => {
  companyClient.CreateCompany(req.body, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('job-portal-events', `Company created: ${response.name}`);
      res.send(response);
    }
  });
});

app.get('/company/:id', (req, res) => {
  companyClient.GetCompany({ id: req.params.id }, (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.send(response);
    }
  });
});

app.put('/company/:id', (req, res) => {
  const updatedCompany = { ...req.body, id: req.params.id };
  companyClient.UpdateCompany(updatedCompany, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('job-portal-events', `Company updated: ${response.name}`);
      res.send(response);
    }
  });
});

app.delete('/company/:id', (req, res) => {
  companyClient.DeleteCompany({ id: req.params.id }, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('job-portal-events', `Company deleted: ${response.name}`);
      res.send(response);
    }
  });
});

// REST Endpoints for Applicant
app.post('/applicant', (req, res) => {
  applicantClient.CreateApplicant(req.body, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('job-portal-events', `Applicant created: ${response.name}`);
      res.send(response);
    }
  });
});

app.get('/applicant/:id', (req, res) => {
  applicantClient.GetApplicant({ id: req.params.id }, (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.send(response);
    }
  });
});

app.put('/applicant/:id', (req, res) => {
  const updatedApplicant = { ...req.body, id: req.params.id };
  applicantClient.UpdateApplicant(updatedApplicant, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('job-portal-events', `Applicant updated: ${response.name}`);
      res.send(response);
    }
  });
});

app.delete('/applicant/:id', (req, res) => {
  applicantClient.DeleteApplicant({ id: req.params.id }, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('job-portal-events', `Applicant deleted: ${response.name}`);
      res.send(response);
    }
  });
});

// REST Endpoints for Application
app.post('/application', (req, res) => {
  applicationClient.CreateApplication(req.body, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('job-portal-events', `Application created: ${response.status}`);
      res.send(response);
    }
  });
});

app.get('/application/:id', (req, res) => {
  applicationClient.GetApplication({ id: req.params.id }, (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.send(response);
    }
  });
});

app.put('/application/:id', (req, res) => {
  const updatedApplication = { ...req.body, id: req.params.id };
  applicationClient.UpdateApplication(updatedApplication, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('job-portal-events', `Application updated: ${response.status}`);
      res.send(response);
    }
  });
});

app.delete('/application/:id', (req, res) => {
  applicationClient.DeleteApplication({ id: req.params.id }, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('job-portal-events', `Application deleted: ${response.status}`);
      res.send(response);
    }
  });
});

// GraphQL Endpoint
const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app });

const port = 3000;
app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
  console.log(`GraphQL endpoint available at http://localhost:${port}${server.graphqlPath}`);
});
