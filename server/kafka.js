import { Kafka } from "kafkajs";
import dotenv from 'dotenv';
dotenv.config();

const kafka = new Kafka({
    clientId:KAFKA_CLIENT_NAME,
    brokers:[process.env.KAFKA_BROKER]
})

let producer = null; 

export async function createProducer(){
    if(producer) return producer;

    const _producer = kafka.producer();
    await _producer.connect();
    producer = _producer
    return producer;
}


export async function produceMessage(message){
    const producer = await createProducer();
    await producer.send({
        messages:[{key:`message-${Date.now()}`, value:message}],
        topic:"MESSAGES"
    })
    return true;
}

export async function startMessageConsumer(io) {
    console.log('Kafka consumer is running');
    const consumer = kafka.consumer({ groupId: 'default' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'MESSAGES', fromBeginning: true });
    await consumer.run({
        autoCommit: true,
        eachMessage: async ({ topic, partition, message }) => {
            if (!message.value) return;
            const parsedMessage = JSON.parse(message.value.toString());
            console.log("New Message Received by Kafka consumer:", parsedMessage);
            // Emit the message to all connected clients
            io.emit('sendMessage', { user: parsedMessage.user, message: parsedMessage.message, id: parsedMessage.id });
        },
    });
}

export default kafka