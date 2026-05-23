const db = require('../config/firebase');

exports.createTransaction = async (req, res) => {
  try {
    const { groupId, type, amount, note } = req.body;

    const createdBy = req.user.uid;

    const createdByName = req.user.name || req.user.email;

    const groupRef = db.collection('groups').doc(groupId);

    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      return res.status(404).json({
        message: 'Group not found',
      });
    }

    const currentBalance = groupDoc.data().balance || 0;

    let newBalance = currentBalance;

    // PEMASUKAN
    if (type === 'income') {
      newBalance += amount;
    }

    // PENGELUARAN
    else {
      if (currentBalance < amount) {
        return res.status(400).json({
          message: 'Saldo tidak mencukupi',
        });
      }

      newBalance -= amount;
    }

    // CREATE TRANSACTION
    await db.collection('transactions').add({
      groupId,
      type,
      amount,
      note,
      createdBy,
      createdByName,
      createdAt: new Date(),
    });

    // UPDATE SALDO
    await groupRef.update({
      balance: newBalance,
    });

    res.json({
      message: 'Transaction created',
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
