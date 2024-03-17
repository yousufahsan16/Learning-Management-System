const { decryptRequest } = require("./authotization-helper");

module.exports = {
    async insertQuestions(db, request) {
        const requestBody = decryptRequest(request.body.payload, request.headers['authorization']);
        // const requestBody = request.body;
        const topicName = Object.keys(requestBody)[0];
        const resourceRole = Object.keys(requestBody[topicName])[0];

        const result = await db.collection('questionnaire').findOne();

        if (result) {
            if (result[topicName]) {
                const update = { $push: {} };

                requestBody[topicName][resourceRole]?.forEach((q) => {
                    if (!result[topicName][resourceRole]?.some((r) => r.Question === q.Question)) {
                        update.$push[[`${topicName}.${resourceRole}`]] = { $each: [q] };
                    }
                });

                if (Object.keys(update.$push).length) {
                    await db.collection('questionnaire').updateOne({}, update);
                }

                else {
                    console.log('Document not updated');
                }
            } else {
                await db.collection('questionnaire').updateOne({},
                    { $set: { [`${topicName}`]: { [`${resourceRole}`]: [{ Question: requestBody[topicName][resourceRole][0].Question, Level: requestBody[topicName][resourceRole][0].Level }] } } }
                )
            }
        } else {
            await db.collection('questionnaire').insertOne(requestBody);
        }
    },

    async getQuestions(db, request) {
        const queryParameters = decryptRequest(request.query.data, request.headers['authorization']);
        // const queryParameters = request.query;
        const topicName = queryParameters['Topic'];
        const resourceRole = queryParameters['Role'];

        const filter = { [`${topicName}.${resourceRole}`]: { $exists: true } }

        const result = await db.collection('questionnaire').findOne(filter);
        const topicQuestions = result?.[topicName]?.[resourceRole];

        if (topicQuestions) {
            return { response: topicQuestions };
        }
    },

    async deleteQuestion(db, request) {
        const requestBody = decryptRequest(request.body.payload, request.headers['authorization']);
        // const requestBody = request.body;
        const topicName = requestBody.Topic;
        const resourceRole = requestBody.Role;
        const filter = { [`${topicName}.${resourceRole}`]: { $exists: true } }
        const update = { $pull: { [`${topicName}.${resourceRole}`]: { Question: requestBody.Question, Level: requestBody.Level } } };

        await db.collection('questionnaire').updateOne(filter, update);
    },

    async editQuestion(db, request) {
        const requestBody = decryptRequest(request.body.payload, request.headers['authorization']);
        // const requestBody = request.body;
        const topicName = requestBody.Topic;
        const resourceRole = requestBody.Role;

        const filter = {
            $and: [
                { [`${topicName}.${resourceRole}.Question`]: requestBody.Question },
                { [`${topicName}.${resourceRole}.Level`]: requestBody.Level },
                { [`${topicName}.${resourceRole}.Answer`]: requestBody.Answer },
            ]
        };

        const update = {
            $set: { [`${topicName}.${resourceRole}.$.Question`]: requestBody.UpdatedQuestion, [`${topicName}.${resourceRole}.$.Level`]: requestBody.UpdatedLevel, [`${topicName}.${resourceRole}.$.Answer`]: requestBody.UpdatedAnswer || '' },
        };

        await db.collection('questionnaire').updateOne(filter, update);
    }
}