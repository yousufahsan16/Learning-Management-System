const { decryptRequest } = require("./authotization-helper");
const { updateTopicStatus } = require("./common-helper");
const { changeResultStatus } = require("./result-helpers");
const { updateRejectedTopicStatus } = require("./topic-helper");

module.exports = {
    async createTaskIndividual(db, request) {
        const requestBody = decryptRequest(request.body.payload, request.headers['authorization']);
        // const requestBody = request.body;
        const filter = {
            $and: [
                { User: requestBody.User },
                { Topic: requestBody.Topic }
            ]
        };

        const result = await db.collection('Tasks').findOne(filter);

        if (result) {
            const update = { $push: { Questions: { $each: [] } }, $set: { DeadLine: requestBody.DeadLine} };

            requestBody.Questions?.forEach((q) => {
                if (!result.Questions?.some((r) => r.Question === q.Question && r.Level === q.Level)) {
                    update.$push['Questions'].$each.push(q);
                }
            });

            if (Object.keys(update.$push.Questions.$each).length || result.DeadLine !== requestBody.DeadLine) {
                await db.collection('Tasks').updateOne(filter, update);
            }
        }
        else {
            await db.collection('Tasks').insertOne(requestBody);
        }

        await updateTopicStatus(db, requestBody.Topic, requestBody.User, "TaskCreated")
    },

    async getTask(db, request) {
        // const queryParameters = request.query;
        const queryParameters = decryptRequest(request.query.data, request.headers['authorization']);
        const filter = {
            $and: [
                { User: queryParameters['User'] },
                { Topic: queryParameters['Topic'] }
            ]
        };

        const result = await db.collection('Tasks').findOne(filter);

        if (result) {
            let questions;

            if (result.Questions) {
                questions = result.Questions.map(q => q);
            } else {
                console.log('No data exists');
            }

            if (['BA', 'DEV', 'QA'].includes(queryParameters['Role'])) {
                await updateTopicStatus(db, queryParameters['Topic'], queryParameters['User'], "InProgress")
                // await db.collection('Tasks').updateOne({}, { $set: { InProgress: true } });
            }

            return {
                DeadLine: result.DeadLine,
                Questions: questions
            };
        }
    },

    async getAllTask(db, request) {
        // const queryParameters = request.query;
        const queryParameters = decryptRequest(request.query.data, request.headers['authorization']);
        const filter = {
            $and: [
                { User: queryParameters['User'] }
            ]
        };

        const result = await db.collection('Tasks').find(filter).toArray();
        let taskToBeDone = [];

        if (result) {
            for (let i = 0; i < result.length; i++) {
                taskToBeDone.push(result[i].Topic);
            }
        }

        return { TaskToBeDone: taskToBeDone };
    },

    async deleteTaskQuestionsIndividual(db, request) {
        const requestBody = decryptRequest(request.body.payload, request.headers['authorization']);
        // const requestBody = request.body;
        const filter = {
            $and: [
                { User: requestBody.User },
                { Topic: requestBody.Topic }
            ]
        };

        const result = await db.collection('Tasks').findOne(filter);

        if (result) {
            if ([1, requestBody.Questions.length].includes(result.Questions.length)) {
                await db.collection('Tasks').deleteOne(filter);
                await updateTopicStatus(db, requestBody.Topic, requestBody.User, "Assign")
            }
            else {
                for (const question of requestBody.Questions) {
                    const update = { $pull: { Questions: { Question: question.Question, Level: question.Level } } };
                    const result = await db.collection('Tasks').updateOne(filter, update);
                    console.log(result);
                }
            }
        }
    },

    async assignTask(db, request) {
        const requestBody = decryptRequest(request.body.payload, request.headers['authorization']);
        // const requestBody = request.body;
        await updateTopicStatus(db, requestBody.Topic, requestBody.ResourceName, "Assign")
    },

    async updateTopicStatusses(db, request) {
        const requestBody = decryptRequest(request.body.payload, request.headers['authorization']);
        // const requestBody = request.body;
        if (requestBody.status.split(' ')[0] === 'Rejected') {
            await updateRejectedTopicStatus(db, requestBody.Topic, requestBody.ResourceName, requestBody.status);
        }

        await updateTopicStatus(db, requestBody.Topic, requestBody.ResourceName, requestBody.status);
    },

    async deleteUserSpecificTasks(db, request) {
        const requestBody = decryptRequest(request.body.payload, request.headers['authorization']);
        const topicName = requestBody.Topic;
        const userName = requestBody.ResourceName
        const filter = {
            $and: [
                { Topic: topicName },
                { User: userName }
            ]
        };
        await db.collection('Tasks').deleteOne(filter);

        if (!requestBody.noStatusChange) {
            await updateTopicStatus(db, topicName, userName, 'Assign');
        }
    },

    async finalizeResult(db, request) {
        const requestBody = decryptRequest(request.body.payload, request.headers['authorization']);
        // const requestBody = request.body;
        await updateTopicStatus(db, requestBody.Topic, requestBody.User, requestBody.Status);
        await changeResultStatus(db, requestBody);
    }
}