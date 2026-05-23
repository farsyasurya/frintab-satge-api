const db = require('../config/firebase');

const admin = require('firebase-admin');
const generateGroupCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  let result = 'FRIN-';

  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

// CREATE GROUP
exports.createGroup = async (req, res) => {
  try {
    const {
      name,
      description,
      category,

      bankType,
      bankName,
      accountNumber,
      accountName,
    } = req.body;

    const userId = req.user.uid;

    const userName = req.user.name || req.user.email;

    // GET USER
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const userData = userDoc.data();

    // FREE LIMIT GROUP
    if (userData.status === 1) {
      const snapshot = await db.collection('groups').get();

      const myGroups = snapshot.docs.filter((doc) => {
        const data = doc.data();

        return data.members?.some((member) => member.uid === userId);
      });

      if (myGroups.length >= 1) {
        return res.status(400).json({
          message: 'User FREE hanya bisa membuat 1 group',
        });
      }
    }

    // GENERATE CODE
    const groupCode = generateGroupCode();

    // CREATE GROUP
    const docRef = await db.collection('groups').add({
      // BASIC
      name,
      description,
      category,

      // CODE
      groupCode,

      // OWNER
      ownerId: userId,
      ownerName: userName,

      // BANK / EWALLET
      payment: {
        type: bankType, // BANK / EWALLET
        name: bankName, // BCA / DANA / GOPAY
        accountNumber,
        accountName,
      },

      // MEMBERS
      members: [
        {
          uid: userId,
          name: userName,
          role: 'OWNER',
          joinedAt: new Date(),
        },
      ],

      // LIMIT
      maxMember: userData.status === 1 ? 5 : 9999,

      // STATUS
      isPro: userData.status === 2,

      // BALANCE
      balance: 0,

      // STATS
      totalTransaction: 0,

      lastTransactionAt: null,

      // SETTINGS
      settings: {
        allowNegativeBalance: false,
        requireApproval: false,
        isLocked: false,
      },

      createdAt: new Date(),
    });

    res.json({
      message: 'Group created',
      id: docRef.id,
      groupCode,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// GET GROUPS
exports.getGroups = async (req, res) => {
  try {
    const snapshot = await db.collection('groups').get();

    const groups = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(groups);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const { groupCode } = req.body;

    const userId = req.user.uid;
    const userName = req.user.name || req.user.email;

    const snapshot = await db.collection('groups').where('groupCode', '==', groupCode).get();

    if (snapshot.empty) {
      return res.status(404).json({
        message: 'Group not found',
      });
    }

    const groupDoc = snapshot.docs[0];

    await groupDoc.ref.update({
      members: admin.firestore.FieldValue.arrayUnion({
        uid: userId,
        name: userName,
      }),
    });

    res.json({
      message: 'Join group success',
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getMyGroups = async (req, res) => {
  try {
    const userId = req.user.uid;

    const snapshot = await db.collection('groups').get();

    const groups = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((group) => group.members?.some((member) => member.uid === userId));

    res.json(groups);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getGroupDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const groupDoc = await db.collection('groups').doc(id).get();

    if (!groupDoc.exists) {
      return res.status(404).json({
        message: 'Group not found',
      });
    }

    const transactionsSnapshot = await db.collection('transactions').where('groupId', '==', id).orderBy('createdAt', 'desc').get();

    const transactions = transactionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      group: {
        id: groupDoc.id,
        ...groupDoc.data(),
      },
      transactions,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
