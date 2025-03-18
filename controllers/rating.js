const db = require('../database');

exports.addRating = async (req, res) => {
    try {
        const userId = req.user.id;
        const { Product_id, rating, review } = req.body;

        if (!Product_id || isNaN(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Invalid rating (must be between 1 and 5)" });
        }

        
        const [deliveredOrders] = await db.execute(
            "SELECT orderId FROM orders WHERE user_id = ? AND order_status = 'Delivered'",
            [userId]
        );

        if (deliveredOrders.length === 0) {
            return res.status(403).json({ success: false, message: "You can only rate products from delivered orders" });
        }

        
        let validOrderId = null;

        for (const order of deliveredOrders) {
            const [orderDetails] = await db.execute(
                "SELECT orderId FROM orderdetails WHERE orderId = ? AND Product_id = ?",
                [order.orderId, Product_id]
            );

            if (orderDetails.length > 0) {
                validOrderId = order.orderId; 
                break;
            }
        }

        if (!validOrderId) {
            return res.status(403).json({ success: false, message: "You can only rate products from delivered orders" });
        }

        
        await db.execute(
            "INSERT INTO ratings (user_id, product_id, orderId, rating, review) VALUES (?, ?, ?, ?, ?)",
            [userId, Product_id, validOrderId, rating, review || null]
        );

        res.status(201).json({ success: true, message: "Rating submitted successfully", orderId: validOrderId });

    } catch (err) {
        console.error("Error submitting rating:", err);
        res.status(500).json({ success: false, message: "Database error", error: err });
    }
};
