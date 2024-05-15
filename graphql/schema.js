const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Job {
  id: ID!
  title: String!
  description: String
  companyId: ID!
  company: Company
}

type Company {
  id: ID!
  name: String!
  location: String
}

type Applicant {
  id: ID!
  name: String!
  resume: String
}

type Application {
  id: ID!
  jobId: ID!
  applicantId: ID!
  status: String!
  job: Job
  applicant: Applicant
}

type Query {
  jobs: [Job]
  job(id: ID!): Job
  companies: [Company]
  company(id: ID!): Company
  applicants: [Applicant]
  applicant(id: ID!): Applicant
  applications: [Application]
  application(id: ID!): Application
}

type Mutation {
  createJob(title: String!, description: String, companyId: ID!): Job
  updateJob(id: ID!, title: String, description: String, companyId: ID!): Job
  deleteJob(id: ID!): String

  createCompany(name: String!, location: String): Company
  updateCompany(id: ID!, name: String!, location: String): Company
  deleteCompany(id: ID!): String

  createApplicant(name: String!, resume: String): Applicant
  updateApplicant(id: ID!, name: String!, resume: String): Applicant
  deleteApplicant(id: ID!): String

  createApplication(jobId: ID!, applicantId: ID!, status: String!): Application
  updateApplication(id: ID!, jobId: ID!, applicantId: ID!, status: String!): Application
  deleteApplication(id: ID!): String
}

`;

module.exports = typeDefs;
