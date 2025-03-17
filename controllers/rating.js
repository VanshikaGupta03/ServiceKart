const db=require('../database');
exports.addRating = async (req, res) => {
    try {
        const userId = req.user.id; 
        const  { Product_id, rating, review } = req.body;

        if (!Product_id || isNaN(rating) || rating < 1 || rating > 5) {
            console.log("Validation Failed - Rating:", Product_id,rating);
            return res.status(400).json({ success: false, message: "Invalid rating (must be between 1 and 5)" });
        }
       
        await db.execute(
            "INSERT INTO ratings (user_id, product_id, rating, review) VALUES (?, ?, ?, ?)",
            [userId, Product_id, rating, review || null]
        );

        res.status(201).json({ success: true, message: "Rating submitted successfully" });
    } catch (err) {
        console.error("Error submitting rating:", err);
        res.status(500).json({ success: false, message: "Database error", error: err });
    }
};

exports.getProductRatings = async (req, res) => {
    try {
        const userId = req.user.id; 
        const { Product_id } = req.body; 

        if (!Product_id) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }

        const [ratings] = await db.execute(
            "SELECT user_id, rating, review, created_at FROM ratings WHERE product_id = ?",
            [Product_id]
        );

        if (ratings.length === 0) {
            return res.status(404).json({ success: false, message: "No ratings found for this product" });
        }

        const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

        const userRating = ratings.find(r => r.user_id === userId) || null;

        res.status(200).json({ 
            success: true, 
            Product_id,
            average_rating: avgRating.toFixed(1), 
            user_rating: userRating,
            
        });

    } catch (err) {
        console.error("Error fetching ratings:", err);
        res.status(500).json({ success: false, message: "Database error", error: err });
    }
};
