const db = require("../database");
exports.orderPlace = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { products, address_id } = req.body;  

        console.log("Order Data:", req.body); 

        if (!user_id || !products || products.length === 0 || !address_id) {
            return res.status(400).json({ success: false, message: "Missing required fields (products or address_id)" });
        }

       
        const [addressData] = await db.execute(
            "SELECT * FROM addresses WHERE address_id = ? AND user_id = ?",
            [address_id, user_id]
        );

        if (addressData.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid address ID" });
        }

        let total_price = 0;
        let allInStock = true;

        for (let product of products) {
            const { Product_id, quantity } = product;

            const [productData] = await db.execute(
                "SELECT Product_price, quantity FROM product WHERE Product_id = ?",
                [Product_id]
            );

            if (productData.length === 0) {
                return res.status(400).json({ success: false, message: `Product ID ${Product_id} not found` });
            }

            const { Product_price, quantity: availableStock } = productData[0];

            total_price += Product_price * quantity;

            if (quantity > availableStock) {
                allInStock = false;
            }

            product.Product_price = Product_price;
        }

        let order_status = allInStock ? "Confirmed" : "Pending";

       
        const [orderResult] = await db.execute(
            "INSERT INTO orders (id, total_price, order_status, address_id) VALUES (?, ?, ?, ?)",
            [user_id, total_price, order_status, address_id]
        );

        const orderId = orderResult.insertId;

        for (let product of products) {
            const { Product_id, Product_price, quantity } = product;

            await db.execute(
                "INSERT INTO orderdetails (orderId, Product_id, Product_price, quantity) VALUES (?, ?, ?, ?)",
                [orderId, Product_id, Product_price, quantity]
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
            order_status, 
            address:addressData[0]
        });

    } catch (err) {
        console.error("Error placing order:", err);
        res.status(500).json({ success: false, message: "Database error", error: err });
    }
};


exports.cancelOrder = async (req, res) => {
    try {
        const user_id = req.user.id; 
        const { orderId } = req.body; 

        if (!orderId) {
            return res.status(400).json({ success: false, message: "Order ID is required" });
        }

        
        const [orderData] = await db.execute(
            "SELECT id, order_status FROM orders WHERE orderId = ?",
            [orderId]
        );

        if (orderData.length === 0) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const { id, order_status } = orderData[0];

       
        if (id !== user_id) {
            return res.status(403).json({ success: false, message: "Unauthorized to cancel this order" });
        }


      
        if (order_status === "Confirmed") {
            const [orderDetails] = await db.execute(
                "SELECT Product_id, quantity FROM orderdetails WHERE orderId = ?",
                [orderId]
            );

            for (let product of orderDetails) {
                await db.execute(
                    "UPDATE product SET quantity = quantity + ? WHERE Product_id = ?",
                    [product.quantity, product.Product_id]
                );
            }
        }

       
        await db.execute(
            "UPDATE orders SET order_status = 'Cancelled' WHERE orderId = ?",
            [orderId]
        );

        res.status(200).json({ success: true, message: "Order canceled successfully" });

    } catch (err) {
        console.error("Error canceling order:", err);
        res.status(500).json({ success: false, message: "Database error", error: err });
    }
};




exports.getOrders = async (req, res) => {
    try {
        const userId = req.user.id; 

       
        const [orders] = await db.execute(
            "SELECT orderId, total_price, order_status, created_at, address_id FROM orders WHERE id = ? ORDER BY created_at DESC",
            [userId]
        );

        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: "No orders found" });
        }

        let finalOrders = [];

     
        for (const order of orders) {
            const orderId = order.orderId;
            let orderData = { ...order, products: [], address: {} };

            const [orderDetails] = await db.execute(
                "SELECT Product_id, Product_price, quantity FROM orderdetails WHERE orderId = ?",
                [orderId]
            );

           
            for (let detail of orderDetails) {
                const [productData] = await db.execute(
                    "SELECT Product_name FROM product WHERE Product_id = ?",
                    [detail.Product_id]
                );

                if (productData.length > 0) {
                    detail.Product_name = productData[0].Product_name;
                }

                orderData.products.push(detail);
            }

           
            if (order.address_id) {
                const [address] = await db.execute(
                    "SELECT address_type, house_area, landmark, person_name, longitude, latitude FROM addresses WHERE id = ?",
                    [order.address_id]
                );

                if (address.length > 0) {
                    orderData.address = address[0];
                }
            }

            finalOrders.push(orderData);
        }

        res.status(200).json({ success: true, orders: finalOrders });
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ success: false, message: "Database error", error: err });
    }
};
