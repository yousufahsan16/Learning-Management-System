const { decryptRequest, generateToken } = require("./authotization-helper");

module.exports = {
    async userLogin(db, request) {
        let requestBody = request.body;
        const filter = {
            $and: [
                { username: requestBody.username },
                { password: requestBody.password }
            ]
        };

        const result = await db.collection('Users').findOne(filter);

        if (result) {
            const token = generateToken({
                username: requestBody.username,
                email: requestBody.password,
                role: result.role,
                team: result.team
            });
            result.token = token;

            return result;
        }
        return { error: "Not found" }
    }
}