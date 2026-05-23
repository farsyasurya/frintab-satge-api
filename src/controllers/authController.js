const admin = require('firebase-admin');
const axios = require('axios');
const db = require("../config/firebase");

const API_KEY = process.env.FIREBASE_API_KEY;

// REGISTER
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const user = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // SAVE TO FIRESTORE
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      name,
      email,
      status: 1, // default FREE
      createdAt: new Date(),
    });

    res.json({
      message: 'Register success',
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
      email,
      password,
      returnSecureToken: true,
    });

    res.json({
      message: 'Login success',
      token: response.data.idToken,
      refreshToken: response.data.refreshToken,
      uid: response.data.localId,
      email: response.data.email,
    });
  } catch (err) {
    console.log(err.response?.data || err.message);

    res.status(401).json({
      error: err.response?.data || err.message,
    });
  }
};
