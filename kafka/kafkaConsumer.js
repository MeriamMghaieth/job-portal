const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'job-portal-system',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'job-portal-group' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'job-portal-events', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        value: message.value.toString(),
      });
    },
  });
};

run().catch(console.error);
