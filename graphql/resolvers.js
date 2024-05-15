const { ApolloError } = require('apollo-server-express');
const Job = require('../job/job');
const Company = require('../company/company');
const Applicant = require('../applicant/applicant');
const Application = require('../application/application');
const sendMessage = require('../kafka/kafkaProducer'); // Ensure correct import

const resolvers = {
  Query: {
    jobs: async () => {
      try {
        const jobs = await Job.find().populate('companyId');
        jobs.forEach(job => {
          console.log(`Job: ${job.title}, CompanyId: ${job.companyId}`);
        });
        return jobs;
      } catch (error) {
        throw new ApolloError(`Error finding jobs: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    job: async (_, { id }) => {
      try {
        return await Job.findById(id).populate('companyId');
      } catch (error) {
        throw new ApolloError(`Error finding job: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    companies: async () => {
      try {
        return await Company.find();
      } catch (error) {
        throw new ApolloError(`Error finding companies: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    company: async (_, { id }) => {
      try {
        return await Company.findById(id);
      } catch (error) {
        throw new ApolloError(`Error finding company: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    applicants: async () => {
      try {
        return await Applicant.find();
      } catch (error) {
        throw new ApolloError(`Error finding applicants: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    applicant: async (_, { id }) => {
      try {
        return await Applicant.findById(id);
      } catch (error) {
        throw new ApolloError(`Error finding applicant: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    applications: async () => {
      try {
        return await Application.find().populate('jobId applicantId');
      } catch (error) {
        throw new ApolloError(`Error finding applications: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    application: async (_, { id }) => {
      try {
        return await Application.findById(id).populate('jobId applicantId');
      } catch (error) {
        throw new ApolloError(`Error finding application: ${error.message}`, "INTERNAL_ERROR");
      }
    },
  },
  Mutation: {
    createJob: async (_, { title, description, companyId }) => {
      try {
        const company = await Company.findById(companyId);
        if (!company) {
          throw new ApolloError("Company not found", "NOT_FOUND");
        }
        const newJob = new Job({ title, description, companyId });
        const job = await newJob.save();
        await sendMessage('job-portal-events', `Job created: ${job.title}`);
        return job;
      } catch (error) {
        throw new ApolloError(`Error creating job: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    updateJob: async (_, { id, title, description, companyId }) => {
      try {
        const company = await Company.findById(companyId);
        if (!company) {
          throw new ApolloError("Company not found", "NOT_FOUND");
        }
        const job = await Job.findByIdAndUpdate(id, { title, description, companyId }, { new: true });
        if (!job) {
          throw new ApolloError("Job not found", "NOT_FOUND");
        }
        await sendMessage('job-portal-events', `Job updated: ${job.title}`);
        return job;
      } catch (error) {
        throw new ApolloError(`Error updating job: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    deleteJob: async (_, { id }) => {
      try {
        const job = await Job.findByIdAndDelete(id);
        if (!job) {
          throw new ApolloError("Job not found", "NOT_FOUND");
        }
        await sendMessage('job-portal-events', `Job deleted: ${job.title}`);
        return "Job deleted successfully";
      } catch (error) {
        throw new ApolloError(`Error deleting job: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    createCompany: async (_, { name, location }) => {
      try {
        const newCompany = new Company({ name, location });
        const company = await newCompany.save();
        await sendMessage('job-portal-events', `Company created: ${company.name}`);
        return company;
      } catch (error) {
        throw new ApolloError(`Error creating company: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    updateCompany: async (_, { id, name, location }) => {
      try {
        const company = await Company.findByIdAndUpdate(id, { name, location }, { new: true });
        if (!company) {
          throw new ApolloError("Company not found", "NOT_FOUND");
        }
        await sendMessage('job-portal-events', `Company updated: ${company.name}`);
        return company;
      } catch (error) {
        throw new ApolloError(`Error updating company: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    deleteCompany: async (_, { id }) => {
      try {
        const company = await Company.findByIdAndDelete(id);
        if (!company) {
          throw new ApolloError("Company not found", "NOT_FOUND");
        }
        await sendMessage('job-portal-events', `Company deleted: ${company.name}`);
        return "Company deleted successfully";
      } catch (error) {
        throw new ApolloError(`Error deleting company: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    createApplicant: async (_, { name, resume }) => {
      try {
        const newApplicant = new Applicant({ name, resume });
        const applicant = await newApplicant.save();
        await sendMessage('job-portal-events', `Applicant created: ${applicant.name}`);
        return applicant;
      } catch (error) {
        throw new ApolloError(`Error creating applicant: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    updateApplicant: async (_, { id, name, resume }) => {
      try {
        const applicant = await Applicant.findByIdAndUpdate(id, { name, resume }, { new: true });
        if (!applicant) {
          throw new ApolloError("Applicant not found", "NOT_FOUND");
        }
        await sendMessage('job-portal-events', `Applicant updated: ${applicant.name}`);
        return applicant;
      } catch (error) {
        throw new ApolloError(`Error updating applicant: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    deleteApplicant: async (_, { id }) => {
      try {
        const applicant = await Applicant.findByIdAndDelete(id);
        if (!applicant) {
          throw new ApolloError("Applicant not found", "NOT_FOUND");
        }
        await sendMessage('job-portal-events', `Applicant deleted: ${applicant.name}`);
        return "Applicant deleted successfully";
      } catch (error) {
        throw new ApolloError(`Error deleting applicant: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    createApplication: async (_, { jobId, applicantId, status }) => {
      try {
        const job = await Job.findById(jobId);
        const applicant = await Applicant.findById(applicantId);
        if (!job || !applicant) {
          throw new ApolloError("Job or Applicant not found", "NOT_FOUND");
        }
        const newApplication = new Application({ jobId, applicantId, status });
        const application = await newApplication.save();
        await sendMessage('job-portal-events', `Application created: ${application.status}`);
        return application;
      } catch (error) {
        throw new ApolloError(`Error creating application: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    updateApplication: async (_, { id, jobId, applicantId, status }) => {
      try {
        const job = await Job.findById(jobId);
        const applicant = await Applicant.findById(applicantId);
        if (!job || !applicant) {
          throw new ApolloError("Job or Applicant not found", "NOT_FOUND");
        }
        const application = await Application.findByIdAndUpdate(id, { jobId, applicantId, status }, { new: true });
        if (!application) {
          throw new ApolloError("Application not found", "NOT_FOUND");
        }
        await sendMessage('job-portal-events', `Application updated: ${application.status}`);
        return application;
      } catch (error) {
        throw new ApolloError(`Error updating application: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    deleteApplication: async (_, { id }) => {
      try {
        const application = await Application.findByIdAndDelete(id);
        if (!application) {
          throw new ApolloError("Application not found", "NOT_FOUND");
        }
        await sendMessage('job-portal-events', `Application deleted: ${application.status}`);
        return "Application deleted successfully";
      } catch (error) {
        throw new ApolloError(`Error deleting application: ${error.message}`, "INTERNAL_ERROR");
      }
    },
  },
  Job: {
    company: async (job) => {
      return await Company.findById(job.companyId);
    },
  },
  Application: {
    job: async (application) => {
      return await Job.findById(application.jobId);
    },
    applicant: async (application) => {
      return await Applicant.findById(application.applicantId);
    },
  },
};

module.exports = resolvers;
