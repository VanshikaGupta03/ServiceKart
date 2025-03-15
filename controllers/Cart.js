const db = require('../database');

exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { products } = req.body; 

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ success: false, message: "Products array is required" });
        }

        let responseList = []; 

        for (let item of products) {
            let { Product_id, Product_name, quantity } = item;

            if (!quantity || quantity <= 0) {
                responseList.push({ Product_id, success: false, message: "Quantity must be greater than 0" });
                continue;
            }

          
            if (!Product_id && Product_name) {
                const [Product] = await db.execute(
                    "SELECT Product_id, quantity FROM product WHERE Product_name = ?",
                    [Product_name]
                );

                if (Product.length === 0) {
                    responseList.push({ Product_name, success: false, message: "Product not found" });
                    continue;
                }

                Product_id = Product[0].Product_id;
            }

            if (!Product_id) {
                responseList.push({ success: false, message: "Product ID or name is required" });
                continue;
            }
            const [ProductData] = await db.execute(
                "SELECT quantity FROM product WHERE Product_id = ?",
                [Product_id]
            );

            if (ProductData.length === 0) {
                responseList.push({ Product_id, success: false, message: "Product not found" });
                continue;
            }

            const availableStock = ProductData[0].quantity;

            if (availableStock === 0) {
                responseList.push({ Product_id, success: false, message: "This product is out of stock" });
                continue;
            }

            if (quantity > availableStock) {
                responseList.push({ 
                    Product_id, 
                    success: false, 
                    message: `Only ${availableStock} items are available in stock`
                });
                continue;
            }

           
            const [existingCartItem] = await db.execute(
                "SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?",
                [userId, Product_id]
            );

            if (existingCartItem.length > 0) {
                let newQuantity = existingCartItem[0].quantity + quantity;
                let addedQuantity = quantity;

                if (newQuantity > availableStock) {
                    addedQuantity = availableStock - existingCartItem[0].quantity;
                    newQuantity = availableStock;
                }

                await db.execute(
                    "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?",
                    [newQuantity, userId, Product_id]
                );

                responseList.push({ 
                    Product_id,
                    success: true,
                    message: `Cart updated successfully. Added ${addedQuantity} items.`,
                    requestedQuantity: quantity, 
                    addedQuantity, 
                    newTotalQuantity: newQuantity
                });
            } else {
                await db.execute(
                    "INSERT INTO cart (user_id, product_id, product_name, quantity) VALUES (?, ?, ?, ?)",
                    [userId, Product_id, Product_name, quantity]
                );

                responseList.push({ Product_id, success: true, message: "Product added to cart" });
            }
        }

        return res.status(200).json({ success: true, results: responseList });
    } catch (err) {
        console.error("Error adding to cart:", err);
        res.status(500).json({ success: false, message: "Database error", error: err });
    }
};



exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { products } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ success: false, message: "Products array is required" });
        }

        let responseList = [];

        for (let item of products) {
            let { Product_id, quantity } = item;

            if (!Product_id || !quantity || quantity <= 0) {
                responseList.push({ Product_id, success: false, message: "Valid Product ID and quantity are required" });
                continue;
            }

        
            const [cartItem] = await db.execute(
                "SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?",
                [userId, Product_id]
            );

            if (cartItem.length === 0) {
                responseList.push({ Product_id, success: false, message: "Product not found in cart" });
                continue;
            }

            let currentQuantity = cartItem[0].quantity;

            if (quantity >= currentQuantity) {
              
                await db.execute(
                    "DELETE FROM cart WHERE user_id = ? AND product_id = ?",
                    [userId, Product_id]
                );

                responseList.push({ Product_id, success: true, message: "Product removed from cart" });
            } else {
                
                let newQuantity = currentQuantity - quantity;

                await db.execute(
                    "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?",
                    [newQuantity, userId, Product_id]
                );

                responseList.push({ 
                    Product_id, 
                    success: true, 
                    message: "Cart updated successfully",
                    removedQuantity: quantity,
                    remainingQuantity: newQuantity
                });
            }
        }

        return res.status(200).json({ success: true, results: responseList });

    } catch (err) {
        console.error("Error removing from cart:", err);
        res.status(500).json({ success: false, message: "Database error", error: err });
    }
};
