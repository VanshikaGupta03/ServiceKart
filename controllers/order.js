const db = require("../database");

exports.orderPlace = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { products } = req.body;  

        console.log("Order Data:", req.body); 

        if (!user_id || !products || products.length === 0) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        let total_price = 0;
        let allInStock = true;

       
        for (let product of products) {
            const { Product_id, quantity } = product;

            const [productData] = await db.execute(
                "SELECT Product_name, Product_price, quantity FROM product WHERE Product_id = ?",
                [Product_id]
            );

            if (productData.length === 0) {
                return res.status(400).json({ success: false, message: `Product ID ${Product_id} not found` });
            }

            const { Product_name, Product_price, quantity: availableStock } = productData[0];

            total_price += Product_price * quantity;

            if (quantity > availableStock) {
                allInStock = false;
            }

       
            product.Product_name = Product_name;
            product.Product_price = Product_price;
        }

       
        let order_status = allInStock ? "Confirmed" : "Pending";

      
        const [orderResult] = await db.execute(
            "INSERT INTO orders (id, total_price, order_status) VALUES (?, ?, ?)",
            [user_id, total_price, order_status]
        );

        const orderId = orderResult.insertId;

        
        for (let product of products) {
            const { Product_id, Product_name, Product_price, quantity } = product;

            await db.execute(
                "INSERT INTO orderdetails (orderId, Product_id, Product_name, Product_price, quantity) VALUES (?, ?, ?, ?, ?)",
                [orderId, Product_id, Product_name, Product_price, quantity]
            );

            
            if (order_status === "Confirmed") {
                await db.execute(
                    "UPDATE product SET quantity = quantity - ? WHERE Product_id = ?",
                    [quantity, Product_id]
                );
            }
        }

        res.status(200).json({ 
            success: true, 
            message: "Order placed successfully", 
            orderId, 
            order_status 
        });

    } catch (err) {
        console.error("Error placing order:", err);
        res.status(500).json({ success: false, message: "Database error", error: err });
    }
};
