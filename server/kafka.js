import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId:'adichat',
    brokers:["192.168.29.71:9092"]
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

export async function startMessageConsumer(){
    console.log('Consumer is running')
    const consumer = kafka.consumer({ groupId:"default"})
    await consumer.connect();
    await consumer.subscribe({topic:"MESSAGES" , fromBeginning:true})
    await consumer.run({
        autoCommit:true,
        eachMessage:async({message,pause})=>{
            if(!message.value) return ;
            console.log("New Message Recieved by kafka consumer")
        }
    })
}

export default kafka