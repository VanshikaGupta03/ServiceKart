const db = require('../database');


exports.addCard = (req, res) => {
    //const user_id = req.user.id; 
    const {user_id, card_type, card_holder_name, card_number, expiry_date } = req.body;

    const query = "INSERT INTO cards (user_id,card_type, card_holder_name, card_number, expiry_date) VALUES (?,?, ?, ?, ?)";
    db.query(query, [user_id, card_type,card_holder_name, card_number, expiry_date], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        res.status(201).json({ message: "Card added successfully", cardId: result.insertId });
    });
};


exports.getCards = (req, res) => {
    const user_id = req.user.id; 

    const query = "SELECT * FROM cards WHERE user_id = ?";
    db.query(query, [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};


exports.updateCard = (req, res) => {
    const user_id = req.user.id;
    //const { cardId } = req.params;
    const { card_holder_name, card_number, expiry_date } = req.body;

    
    const checkQuery = "SELECT * FROM cards WHERE id = ? AND user_id = ?";
    db.query(checkQuery, [ user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(403).json({ message: "Unauthorized to update this card" });

       
        const updateQuery = "UPDATE cards SET card_holder_name = ?, card_number = ?, expiry_date = ? WHERE id = ?";
        db.query(updateQuery, [card_holder_name, card_number, expiry_date], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Card updated successfully" });
        });
    });
};


exports.deleteCard = (req, res) => {
    const user_id = req.user.id;
    const { cardId } = req.params;

    const checkQuery = "SELECT * FROM cards WHERE id = ? AND user_id = ?";
    db.query(checkQuery, [cardId, user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(403).json({ message: "Unauthorized to delete this card" });

        
        const deleteQuery = "DELETE FROM cards WHERE id = ?";
        db.query(deleteQuery, [cardId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Card deleted successfully" });
        });
    });
};
