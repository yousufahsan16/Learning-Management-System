const { decryptRequest } = require("./authotization-helper");

module.exports = {
    async addTopic(db, request) {
        // const requestBody = request.body;
        const requestBody = decryptRequest(request.body.payload, request.headers['authorization']);
        const topic = requestBody['Topic'];
        const role = requestBody['Role'];
        const filter = {
            $and: [
                { Topic: topic },
                { Role: role }
            ]
        };

        const result = await db.collection('topics').findOne(filter);

        if (!result) {
            await db.collection('topics').insertOne({ Topic: topic, Role: role, Description: requestBody['Description'] });

            await insertUserSpecificTopics(db, requestBody);
        }
    },

    async getAllTopics(db, request) {
        const result = await db.collection('topics').find().toArray();
        let response = [];
        result.map((t) => t.Topic);

        result.forEach((t) => response.push({
            Topic: t.Topic,
            Role: t.Role,
            Description: t.Description
        }));

        return { Topics: response }
    },

    async deleteTopic(db, request, client) {
        // const requestBody = request.body;
        const requestBody = decryptRequest(request.body.payload, request.headers['authorization']);
        const session = client.startSession();

        try {
            await session.withTransaction(async () => {
                await db.collection('topics').deleteOne({ Topic: requestBody.Topic, Role: requestBody.Role }, { session });
                await deleteTopicDependentData(db, requestBody, session);
                await session.commitTransaction();
            });
        } catch (err) {
            console.error(err);
        } finally {
            session.endSession();
        }
    },

    async getUserSpecificTopics(db, request) {
        // const queryParameters = request.query;
        const queryParameters = decryptRequest(request.query.data, request.headers['authorization']);

        const result = await db.collection('userSpecificTopics').find().toArray();
        let response = [];

        result.forEach((t) => {
            const topicName = Object.keys(t)[1];
            const topicObject = t[topicName];
            const userObject = topicObject[queryParameters['User']];

            if (userObject) {
                response.push({
                    Topic: Object.keys(t)[1],
                    DeadLine: userObject.DeadLine,
                    Progress: userObject.Progress,
                    NoOfAttempts: userObject.NoOfAttempts,
                    InProgress: userObject.InProgress,
                    TopicStatus: userObject.TopicStatus,
                    Reason: userObject.Reason
                })
            }
        });

        return { Topics: response };
    },

    async updateRejectedTopicStatus(db, topicName, resourceName, status) {
        const filter = { [`${topicName}.${resourceName}`]: { $exists: true } };

        const update = { $set: { [`${topicName}.${resourceName}.TopicStatus`]: status.split(' ')[0], [`${topicName}.${resourceName}.Reason`]: (status.substring(status.indexOf(' ') + 1)) ?? '' } };

        return await db.collection('userSpecificTopics').updateOne(filter, update);
    }
}

async function insertUserSpecificTopics(db, requestBody) {
    const topicName = requestBody.Topic;
    const targettedResource = requestBody.TargettedResource;

    let userData = {};

    const filter = { [`${topicName}`]: { $exists: true } };
    const result0 = await db.collection('userSpecificTopics').findOne(filter);


    for (const resourceName of targettedResource) {
        if (!result0) {
            Object.assign(userData, {
                [`${resourceName}`]: {
                    DeadLine: "",
                    Progress: "",
                    NoOfAttempts: "",
                    InProgress: false,
                    TopicStatus: ""
                },
            });
        } else if (result0 && result0[topicName] && !result0[topicName][resourceName]) {
            await db.collection('userSpecificTopics').updateOne({}, { $set: { [`${topicName}.${resourceName}`]: { DeadLine: "", Progress: "", NoOfAttempts: "", InProgress: false }, } });
        }
    }

    if (Object.keys(userData).length > 0) {
        const dataToInsert = { [`${topicName}`]: userData }
        await db.collection('userSpecificTopics').insertOne(dataToInsert);
    }
}

async function deleteTopicDependentData(db, requestBody, session) {
    await deleteTopicQuestions(db, requestBody, session);
    await deleteTopicTasks(db, requestBody, session);
    await deleteTopicResult(db, requestBody, session);
    await deleteUserSpecificTopics(db, requestBody, session);
}

async function deleteUserSpecificTopics(db, requestBody, session) {
    const topicName = requestBody.Topic;
    const targettedResource = requestBody.TargettedResource;
    const filter = { [`${topicName}`]: { $exists: true } };

    const topicNode = await db.collection('userSpecificTopics').findOne(filter, { session });

    if (topicNode) {
        const existingUserCount = Object.keys(topicNode[topicName]).length;

        if ([1, targettedResource.length].includes(existingUserCount)) {
            await db.collection('userSpecificTopics').deleteOne({ [`${topicName}`]: { $exists: true } }, { session });
        } else {
            for (const resourceName of targettedResource) {
                if (topicNode && topicNode[topicName] && topicNode[topicName][resourceName]) {
                    const filter = { [`${topicName}.${resourceName}`]: { $exists: true } }
                    await db.collection('userSpecificTopics').updateOne(filter, { $unset: { [`${topicName}.${resourceName}`]: { DeadLine: "", Progress: "", NoOfAttempts: "", InProgress: false }, } }, { session });
                }
            }
        }
    }
}

async function deleteTopicQuestions(db, requestBody, session) {
    const topicName = requestBody.Topic;
    const userRole = requestBody.Role
    const filter = { [`${topicName}.${userRole}`]: { $exists: true } };

    const topicNode = await db.collection('questionnaire').findOne({}, { session });

    if (topicNode && topicNode[topicName]) {
        const unsetQuery = {};
        if (Object.keys(topicNode[topicName]).length === 1) {
            unsetQuery[topicName] = '';

            return await db.collection('questionnaire').updateMany(filter, { $unset: unsetQuery }, { session });
        }

        unsetQuery[topicName + '.' + userRole] = '';

        return await db.collection('questionnaire').updateMany(filter, { $unset: unsetQuery }, { session });
    }
}

async function deleteTopicTasks(db, requestBody, session) {
    const topicName = requestBody.Topic;
    const userRole = requestBody.Role
    const filter = {
        $and: [
            { Topic: topicName },
            { Role: userRole }
        ]
    };

    return await db.collection('Tasks').deleteMany(filter, { session });
}

async function deleteTopicResult(db, requestBody, session) {
    const topicName = requestBody.Topic;
    const userResults = await db.collection('Results').find().toArray();

    for (let i = 0; i < userResults.length; i++) {
        const element = userResults[i];
        const userResult = Object.values(element)[1];
        const userName = Object.keys(element)[1];
        const userResultsLength = Object.keys(userResult).length;

        for (let j = 0; j < userResultsLength; j++) {
            if (userResult[topicName]) {
                const unsetQuery = {};
                unsetQuery[`${userName}.${topicName}`] = '';
                const filter = { [`${userName}.${topicName}`]: { $exists: true } };
                await db.collection('Results').updateOne(filter, { $unset: unsetQuery }, { session });
            }
        }
    }
}