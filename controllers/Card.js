const db = require('../database');
const { cardValidationSchema } = require("../validation");


exports.addCard =async (req, res) => {
    const { error } = cardValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
    const user_id = req.user.id; 
    console.log("Request received:", req.body);
    const { card_type, card_holder_name, card_number, expiry_date } = req.body;

    const [insertResult]= await db.query( 
        "INSERT INTO cards (user_id,card_type, card_holder_name, card_number, expiry_date) VALUES (?,?, ?, ?, ?)",
     [ user_id,card_type,card_holder_name, card_number, expiry_date]
    );
       
     
        return res.status(201).json({ message: "Card added successfully", cardId: insertResult.insertId });
      
    }



    exports.getCards = async (req, res) => {
        try {
           
            const user_id = req.user.id;  
    
            if (!user_id) {
                return res.status(400).json({ message: "User ID is required" });
            }
    
            
            const [cards] = await db.query("SELECT * FROM cards WHERE user_id = ?", [user_id]);
    
            res.status(200).json({ message: "Cards retrieved successfully", cards });
    
        } catch (error) {
            console.error("Get Cards Error:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    };
    

exports.updateCard = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { cardId } = req.params;
        const {  card_type, card_holder_name, card_number, expiry_date } = req.body;

        if (!user_id || !cardId || !card_type || !card_holder_name || !card_number || !expiry_date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        
        const [existingCard] = await db.query("SELECT * FROM cards WHERE id = ? AND user_id = ?", [cardId, user_id]);

        if (existingCard.length === 0) {
            return res.status(403).json({ message: "Unauthorized to update this card or card not found" });
        }

        
        await db.query(
            "UPDATE cards SET card_type = ?, card_holder_name = ?, card_number = ?, expiry_date = ? WHERE id = ? AND user_id = ?",
            [card_type, card_holder_name, card_number, expiry_date, cardId, user_id]
        );

        return res.json({ message: "Card updated successfully" });
    } catch (error) {
        console.error("Error updating card:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



exports.deleteCard = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { cardId } = req.params;
       

        if (!user_id || !cardId) {
            return res.status(400).json({ message: "User ID and Card ID are required" });
        }

        
        const [existingCard] = await db.query("SELECT * FROM cards WHERE id = ? AND user_id = ?", [cardId, user_id]);

        if (existingCard.length === 0) {
            return res.status(403).json({ message: "Unauthorized to delete this card or card not found" });
        }

        
        await db.query("DELETE FROM cards WHERE id = ? AND user_id = ?", [cardId, user_id]);

        return res.json({ message: "Card deleted successfully" });
    } catch (error) {
        console.error("Error deleting card:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

