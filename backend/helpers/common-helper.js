const { MongoClient } = require('mongodb');
// const MONGO_DB_URL = process.env.MONGO_DB_URL || 'mongodb://127.0.0.1:27017';
const MONGO_DB_URL = process.env.MONGO_DB_URL || 'mongodb://127.0.0.1:27017/mydb?replicaSet=rs0';


//To connect authorized database
// const uri = 'mongodb://TeamDaredevil1:TeamDaredevil1@127.0.0.1:27017/database';
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = {
    async connectDB(actualFunction, request, apiResponse, isSessionRequired = false) {
        await manageDBConnection(actualFunction, request, apiResponse, isSessionRequired)
    },

    async updateTopicStatus(db, topicName, resourceName, status) {
        const filter = { [`${topicName}.${resourceName}`]: { $exists: true } };

        const update = { $set: { [`${topicName}.${resourceName}.TopicStatus`]: status } };

        return await db.collection('userSpecificTopics').updateOne(filter, update);
    }
}

async function manageDBConnection(actualFunction, request, apiResponse, isSessionRequired) {
    const client = new MongoClient(MONGO_DB_URL);

    try {
        await client.connect();
        const db = client.db('database');
        let result;

        if (isSessionRequired) {
            result = await actualFunction(db, request, client);
        }
        else {
            result = await actualFunction(db, request)
        }

        apiResponse.send(result);
    } catch (e) {
        apiResponse.statusCode = 500;
        apiResponse.send({
            error: e.message
        });
        console.error(e);
    } finally {
        await client.close();
    }
}


function getIsExistFilter(fieldToCheck) {
    return { [`${fieldToCheck}`]: { $exists: true } };
}