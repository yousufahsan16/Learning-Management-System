const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { connectDB } = require('./helpers/common-helper');
const { getGrading, getResults, editResults } = require('./helpers/result-helpers');
const { addTopic, getAllTopics, deleteTopic, getUserSpecificTopics } = require('./helpers/topic-helper');
const { insertQuestions, getQuestions, deleteQuestion, editQuestion } = require('./helpers/questionnaire-helper');
const { createTaskIndividual, getTask, getAllTask, deleteTaskQuestionsIndividual, assignTask, deleteUserSpecificTasks, finalizeResult, updateTopicStatusses } = require('./helpers/task-helper');
const { verifyToken, generateToken } = require('./helpers/authotization-helper');
const { userLogin } = require('./helpers/users-helper');

app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const port = process.env.PORT || 3005;

server.listen(port, function () {
    console.log(
        `mock listening at http://localhost:${port}`
    );
});

app.post("/login", async (request, apiResponse) => {
    await connectDB(userLogin, request, apiResponse);
});

app.post("/getGrading", verifyToken, async (request, apiResponse) => {
    await connectDB(getGrading, request, apiResponse);
});

app.get("/getResults", verifyToken, async (request, apiResponse) => {
    await connectDB(getResults, request, apiResponse);
});

app.post("/editResults", verifyToken, async (request, apiResponse) => {
    await connectDB(editResults, request, apiResponse);
});


app.post("/addTopic", verifyToken, async (request, apiResponse) => {
    await connectDB(addTopic, request, apiResponse);
});

app.get("/getAllTopics", verifyToken, async (request, apiResponse) => {
    await connectDB(getAllTopics, request, apiResponse);
});

app.post("/deleteTopic", verifyToken, async (request, apiResponse) => {
    await connectDB(deleteTopic, request, apiResponse, true);
});

app.get("/getUserSpecificTopics", verifyToken, async (request, apiResponse) => {
    await connectDB(getUserSpecificTopics, request, apiResponse);
});

app.post("/insertQuestions", verifyToken, async (request, apiResponse) => {
    await connectDB(insertQuestions, request, apiResponse);
});

app.get("/getQuestions", verifyToken, async (request, apiResponse) => {
    await connectDB(getQuestions, request, apiResponse);
});

app.post("/deleteQuestion", verifyToken, async (request, apiResponse) => {
    await connectDB(deleteQuestion, request, apiResponse);
});

app.post("/editQuestion", verifyToken, async (request, apiResponse) => {
    await connectDB(editQuestion, request, apiResponse);
});

app.post("/createTaskIndividual", verifyToken, async (request, apiResponse) => {
    await connectDB(createTaskIndividual, request, apiResponse);
});

app.get("/getTask", verifyToken, async (request, apiResponse) => {
    await connectDB(getTask, request, apiResponse);
});

app.get("/getAllTask", verifyToken, async (request, apiResponse) => {
    await connectDB(getAllTask, request, apiResponse);
});

app.post("/deleteTaskQuestionsIndividual", verifyToken, async (request, apiResponse) => {
    await connectDB(deleteTaskQuestionsIndividual, request, apiResponse);
});

app.post("/assignTask", verifyToken, async (request, apiResponse) => {
    await connectDB(assignTask, request, apiResponse);
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Authenticate user and generate JWT token
    const token = generateToken({
        id: 63108,
        username: "ArsalanAliRajput",
        email: "arsalanali188@gmail.com"
    });

    res.json({ token });
});

app.get('/api/protected-resource', verifyToken, (req, res) => {
    res.json({ message: 'This is a protected resource' });
});

app.post("/updateUserSpecificTopics", verifyToken, async (request, apiResponse) => {
    await connectDB(updateTopicStatusses, request, apiResponse);
});

app.post("/finalizeResult", verifyToken, async (request, apiResponse) => {
    await connectDB(finalizeResult, request, apiResponse);
});

app.post("/deleteUserSpecificTasks", verifyToken, async (request, apiResponse) => {
    await connectDB(deleteUserSpecificTasks, request, apiResponse);
});