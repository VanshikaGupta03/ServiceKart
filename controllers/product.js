const db = require('../database'); 



exports.getProducts = async (req, res) => {
    try {
       
        const userId = req.user.id;

        const query = `
            SELECT 
                Product_id, 
                Product_name, 
                Product_price, 
                Product_image, 
                status, 
                quantity 
            FROM product
        `;

        const [results] = await db.execute(query);

        res.status(200).json({ 
            success: true, 
            userId: userId,  
            products: results 
        });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ success: false, message: 'Database error', error: err });
    }
};
