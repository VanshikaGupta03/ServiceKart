const db=require('../database');
exports.addMoneyToWallet = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid amount" });
        }

        await db.execute(
            "INSERT INTO wallets (user_id, balance) VALUES (?, ?) ON DUPLICATE KEY UPDATE balance = balance + ?",
            [user_id, amount, amount]
        );

        await db.execute(
            "INSERT INTO transactions (user_id, amount, transaction_type) VALUES (?, ?, 'credit')",
            [user_id, amount]
        );

        res.status(200).json({ success: true, message: "Money added to wallet successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Database error", error: err });
    }
};

exports.spendFromWallet = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { amount } = req.body;

        const [wallet] = await db.execute(
            "SELECT balance FROM wallets WHERE user_id = ?",
            [user_id]
        );

        if (wallet.length === 0 || wallet[0].balance < amount) {
            return res.status(400).json({ success: false, message: "Insufficient wallet balance" });
        }

        await db.execute(
            "UPDATE wallets SET balance = balance - ? WHERE user_id = ?",
            [amount, user_id]
        );

        await db.execute(
            "INSERT INTO transactions (user_id, amount, transaction_type) VALUES (?, ?, 'debit')",
            [user_id, amount]
        );

        res.status(200).json({ success: true, message: "Payment successful from wallet" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Database error", error: err });
    }
};

exports.getWalletBalance = async (req, res) => {
    try {
        const user_id = req.user.id;

        const [wallet] = await db.execute(
            "SELECT balance FROM wallets WHERE user_id = ?",
            [user_id]
        );

        res.status(200).json({ success: true, balance: wallet[0]?.balance || 0 });
    } catch (err) {
        res.status(500).json({ success: false, message: "Database error", error: err });
    }
};
