const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'ph7W9XhGvTnMkP6rJLsU8sN6uQz2YmB7fA9dRcV3eDpGk5Fj8LwTzHbN6qZ7n9jK3tR5yUv7xWc2QbEhCmGn5Ft9jLkP7rBhS2eV';

module.exports = {
    generateToken(user) {
        const token = jwt.sign(
            user,
            JWT_SECRET,
            { expiresIn: '9h' }
        );

        return token;
    },

    verifyToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Missing authentication token' });
        }

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired authentication token' });
            }
            req.user = user;
            next();
        });

        // next();
    },

    decryptRequest(payload, secretKey) {
        const encryptedPayload = payload;// request.body.payload || request.query.data;
        const decryptedPayload = CryptoJS.AES.decrypt(encryptedPayload, secretKey.split(' ')[1]).toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedPayload);
    }
}