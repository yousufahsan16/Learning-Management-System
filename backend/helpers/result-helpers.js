const { Configuration, OpenAIApi } = require("openai");
const { decryptRequest } = require("./authotization-helper");
const { updateTopicStatus } = require("./common-helper");

module.exports = {
    async getGrading(db, request) {
        // const requestBody = request.body;
        const requestBody = decryptRequest(request.body.payload, request.headers['authorization']);
        const { Topic: topicName, Role: resourceRole, Questions: questions, User: resourceName } = requestBody
        let totalRating = 0;
        let percentage = 0;
        let calculatedLevel;
        let entryLevelCount = intermediateLevelCount = expertLevelCount = 0;
        const answerRatingArray = [];

        const filter = { [`${topicName}.${resourceRole}`]: { $exists: true } }
        const result = await db.collection('questionnaire').findOne(filter);
        const topicQuestions = result?.[topicName]?.[resourceRole];

        if (topicQuestions) {
            const questionsArray = [];
            let i = 0;
            for (let q of questions) {
                let responseObj = {
                    Question: q.Question,
                    Answer: q.Answer,
                    Level: q.Level,
                    Rating: 0,
                    PositivePoints: "-",
                    MissingPoints: "-"
                }

                if (q.Level === 'Entry') {
                    const findQuestion = topicQuestions.find(ques => ques.Question === q.Question);
                    responseObj.Rating = findQuestion?.Answer === q.Answer ? 1 : 0;
                    if (responseObj.Rating === 1) {
                        entryLevelCount++; // Increment counter for correct answer
                    }
                } else if (entryLevelCount >= 4) {
                    if (i > 4 && i <= 9) {
                        const grading = await getRatings(q);
                        responseObj.Rating = grading.rating;
                        responseObj.PositivePoints = grading['positive point'];
                        responseObj.MissingPoints = grading['missing points'];
                        answerRatingArray.push(responseObj.Rating);
                    } else if (((totalRating * 100) / 30) > 60) {
                        const grading = await getRatings(q);
                        responseObj.Rating = grading.rating;
                        responseObj.PositivePoints = grading['positive point'];
                        responseObj.MissingPoints = grading['missing points'];
                        answerRatingArray.push(responseObj.Rating);
                    }
                    // if (answerRatingArray.length === 0 || answerRatingArray[i - 4] >= 3) {
                    //     const grading = await getRatings(q);
                    //     responseObj.Rating = grading.rating;
                    //     responseObj.PositivePoints = grading['positive point'];
                    //     responseObj.MissingPoints = grading['missing points'];
                    //     answerRatingArray.push(responseObj.Rating);
                    //     if (q.Level === 'Intermediate') {
                    //         intermediateLevelCount += responseObj.Rating;
                    //     }
                    //     else {
                    //         expertLevelCount += responseObj.Rating;
                    //     }
                    // }
                }
                questionsArray.push(responseObj);
                totalRating += responseObj.Rating;
                i++;
            }

            const percentageAndLevel = getPercentageAndLevel(questionsArray, totalRating);

            const allInformation = {
                [`${resourceName}`]: {
                    [`${topicName}`]: {
                        Results: [{
                            Questions: questionsArray,
                            TotalGrades: totalRating,
                            AttemptNo: ""
                        }],
                        Percentage: percentageAndLevel.percentage,
                        Level: percentageAndLevel.calculatedLevel,
                        isReviewed: false
                    }
                }
            }

            return {
                response: await submitResults(db, allInformation)
            }
        }
    },

    async getResults(db, request) {
        const queryParameters = decryptRequest(request.query.data, request.headers['authorization']);
        // const queryParameters = request.query;
        const filter = { [`${queryParameters['User']}.${queryParameters['Topic']}`]: { $exists: true } }

        const result = await db.collection('Results').findOne(filter);

        if (result) {
            return result;
        }
    },

    async editResults(db, request) {
        const requestBody = decryptRequest(request.body.payload, request.headers['authorization']);
        // const requestBody = request.body;
        const user = requestBody.User;
        const topic = requestBody.Topic;
        const filter = { [`${user}.${topic}`]: { $exists: true } }

        const result = await db.collection('Results').findOne(filter);

        if (result) {
            const updatedRating = calculateTotalGrades(requestBody, result[user][topic].Results);

            const filter = {
                [`${user}.${topic}.Results.AttemptNo`]: requestBody.AttemptNo,
                [`${user}.${topic}.Results.Questions.Question`]: requestBody.RatingToUpdate.Question,
                [`${user}.${topic}.Results.Questions.Answer`]: requestBody.RatingToUpdate.Answer,
                [`${user}.${topic}.Results.Questions.Level`]: requestBody.RatingToUpdate.Level,
                [`${user}.${topic}.Results.Questions.Rating`]: requestBody.RatingToUpdate.Rating,
                [`${user}.${topic}.Results.Questions.PositivePoints`]: requestBody.RatingToUpdate.PositivePoints,
                [`${user}.${topic}.Results.Questions.MissingPoints`]: requestBody.RatingToUpdate.MissingPoints
            };

            const update = {
                $set: {
                    [`${user}.${topic}.Results.$[i].TotalGrades`]: updatedRating.totalGrading,
                    [`${user}.${topic}.Level`]: updatedRating.percentageAndLevel.calculatedLevel,
                    [`${user}.${topic}.Percentage`]: updatedRating.percentageAndLevel.percentage,
                    [`${user}.${topic}.Results.$[i].Questions.$[j].Rating`]: requestBody.UpdatedRatings.Rating,
                    [`${user}.${topic}.Results.$[i].Questions.$[j].PositivePoints`]: requestBody.UpdatedRatings.PositivePoints,
                    [`${user}.${topic}.Results.$[i].Questions.$[j].MissingPoints`]: requestBody.UpdatedRatings.MissingPoints
                },
            };

            const options = { arrayFilters: [{ 'i.Questions.Question': requestBody.RatingToUpdate.Question }, { 'j.Question': requestBody.RatingToUpdate.Question }] };

            await db.collection('Results').updateOne(filter, update, options);

        }
    },

    async changeResultStatus(db, requestBody) {
        const user = requestBody.User;
        const topic = requestBody.Topic;
        const filter = { [`${user}.${topic}`]: { $exists: true } }

        const result = await db.collection('Results').findOne(filter);

        if (result) {

            const filter = {
                [`${user}.${topic}.Results.AttemptNo`]: requestBody.AttemptNo
            };

            const update = {
                $set: {
                    [`${user}.${topic}.Results.$.isReviewed`]: true
                },
            };

            await db.collection('Results').updateOne(filter, update);
        }
    },

    // async editUserLevel(db, request) {
    //     const requestBody = decryptRequest(request.body.payload, request.headers['authorization']);
    //     // const requestBody = request.body;
    //     const user = requestBody.User;
    //     const topic = requestBody.Topic;
    //     const filter = { [`${user}.${topic}`]: { $exists: true } }

    //     const result = await db.collection('Results').findOne(filter);

    //     if (result) {
    //         await db.collection('Results').updateOne(filter, { $set: { [`${user}.${topic}.Level`]: requestBody.Level } })
    //     }
    // }
}

async function getRatings(questionObject) {
    const configuration = new Configuration({
        apiKey: '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',
    });

    const question = questionObject.Question;
    const answer = questionObject.Answer;
    const expLevel = questionObject.Level;

    const promptSample = `Question: ${question}\nAnswer: ${answer}\nCan you rate this answer as it is given by a ${expLevel} level developer in the sequence rate 1-5, positive point, Missing points`

    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: promptSample,
        temperature: 0,
        max_tokens: 500
    });

    const grading = response.data.choices[0].text.split('\n').filter(Boolean);

    console.log(response.data.choices[0].text)

    const ratingIndex = grading[0]?.indexOf('Rating: ');
    const rating = Number(grading[0]?.substring(ratingIndex + 8, ratingIndex + 9));
    const positivePointsIndex = grading[1]?.indexOf('Rating: ');
    const positivePoints = grading[1]?.substring(positivePointsIndex + 18);
    const missingPointsIndex = grading[2]?.indexOf('Rating: ');
    const missingPoints = grading[2]?.substring(missingPointsIndex + 17);
    console.log(rating);

    return {
        'rating': rating,
        'positive point': positivePoints,
        'missing points': missingPoints
    };
}

async function submitResults(db, user) {
    const topic = Object.values(user)[0];
    const userName = Object.keys(user)[0];
    const topicName = Object.keys(topic)[0];
    // const results = requestBody[user][topic].Results;

    const filter = { [`${userName}`]: { $exists: true } }

    const result = await db.collection('Results').findOne(filter);
    let attemptNo = 1;
    let response;

    if (result) {
        if (result[userName][topicName]) {
            const update = { $push: {}, $set: {} };
            attemptNo = result[userName][topicName].Results.length + 1;
            user[userName][topicName].Results[0].AttemptNo = attemptNo;
            update.$push[[`${userName}.${topicName}.Results`]] = { $each: [user[userName][topicName].Results[0]] }
            update.$set[[`${userName}.${topicName}.Level`]] = user[userName][topicName].Level;
            update.$set[[`${userName}.${topicName}.Percentage`]] = user[userName][topicName].Percentage;
            update.$set[[`${userName}.${topicName}.isReviewed`]] = user[userName][topicName].isReviewed;
            response = await db.collection('Results').updateOne({}, update)
        }
        else {
            user[userName][topicName].Results[0].AttemptNo = attemptNo;
            response = await db.collection('Results').updateOne({},
                { $set: {
                    [`${userName}.${topicName}.Results`]: [user[userName][topicName].Results[0]],
                    [`${userName}.${topicName}.Level`]: user[userName][topicName].Level,
                    [`${userName}.${topicName}.Percentage`]: user[userName][topicName].Percentage,
                    [`${userName}.${topicName}.isReviewed`]: user[userName][topicName].isReviewed
                } })
        }
    } else {
        user[userName][topicName].Results[0].AttemptNo = attemptNo;
        response = await db.collection('Results').insertOne(user);
    }

    await updateTopicStatus(db, topicName, userName, "ResultSubmitted")

    return response;
};

function calculateTotalGrades(requestBody, dbResults) {
    const ratingToUpdate = requestBody.RatingToUpdate;
    let totalGrading = 0;
    let percentageAndLevel;
    for (let i = 0; i < dbResults.length; i++) {
        const result = dbResults[i];

        if (requestBody.AttemptNo === result.AttemptNo) {
            for (let j = 0; j < result.Questions.length; j++) {
                const question = result.Questions[j];
                if (JSON.stringify(question) === JSON.stringify(ratingToUpdate)) {
                    totalGrading += Number(requestBody.UpdatedRatings.Rating)
                }
                else {
                    totalGrading += Number(question.Rating);
                }
            }
            percentageAndLevel = getPercentageAndLevel(result.Questions, totalGrading);
        }

    }
    return { totalGrading, percentageAndLevel };
}

function getPercentageAndLevel (questionsArray, totalRating) {
    if (questionsArray.length === 15) {
        percentage = (totalRating * 100) / 55;
    } else if (questionsArray.length === 10) {
        percentage = (totalRating * 100) / 30;
    } else {
        percentage = (totalRating * 100) / 5;
    }

    if (percentage >= 80) {
        calculatedLevel = 'Expert';
    } else if (percentage >= 60 && percentage < 80) {
        calculatedLevel = 'Intermediate';
    } else {
        calculatedLevel = 'Entry';
    }
    return {
        percentage: percentage,
        calculatedLevel: calculatedLevel
    }
}