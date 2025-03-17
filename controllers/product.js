const db = require('../database'); 

exports.getProducts = async (req, res) => {
    try {
        const userId = req.user.id;
        const { search, page = 1, limit = 5 } = req.query; 

        let query = `
            SELECT 
                Product_id, 
                Product_name, 
                Product_price, 
                Product_image, 
                status, 
                quantity 
            FROM product
        `;

        let queryParams = [];
        let countQuery = `SELECT COUNT(*) AS total FROM product`; 

       
        if (search && search.length >= 2) {
            query += " WHERE Product_name LIKE ?";
            countQuery += " WHERE Product_name LIKE ?";
            queryParams.push(`${search}%`);
        }

       
        const offset = (page - 1) * limit; 
        query += ` LIMIT ? OFFSET ?`;
        queryParams.push(parseInt(limit), parseInt(offset));

      
        const [results] = await db.execute(query, queryParams);

        
        const [countResult] = await db.execute(countQuery, queryParams.slice(0, -2)); 
        const totalProducts = countResult[0].total;
        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({ 
            success: true, 
            userId: userId,  
            products: results,
            // pagination: {
            //     currentPage: parseInt(page),
            //     totalPages: totalPages,
            //     totalProducts: totalProducts,
            //     limit: parseInt(limit),
            // }
        });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ success: false, message: 'Database error', error: err });
    }
};
