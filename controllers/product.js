const db = require('../database');

exports.getProducts = async (req, res) => {
    try {
        const { search, page = 1, limit = 5 } = req.query;

       
        let productQuery = `SELECT Product_id, Product_name, Product_price, Product_image, status, quantity FROM product`;
        let queryParams = [];

        if (search && search.length >= 2) {
            productQuery += " WHERE Product_name LIKE ?";
            queryParams.push(`${search}%`);
        }

        const offset = (page - 1) * limit;
        productQuery += ` LIMIT ? OFFSET ?`;
        queryParams.push(parseInt(limit), parseInt(offset));

        const [products] = await db.execute(productQuery, queryParams);

        if (products.length === 0) {
            return res.status(200).json({ success: true, products: [] });
        }

        
        const productIds = products.map(p => p.Product_id);
        const placeholders = productIds.map(() => "?").join(",");
        const ratingQuery = `SELECT product_id, COALESCE(AVG(rating), 0) AS avg_rating FROM ratings WHERE product_id IN (${placeholders}) GROUP BY product_id`;

        const [ratings] = await db.execute(ratingQuery, productIds);

      
        const ratingMap = Object.fromEntries(ratings.map(r => [r.product_id, Number(r.avg_rating).toFixed(1)]));

        const productsWithRatings = products.map(p => ({
            ...p,
            avg_rating: ratingMap[p.Product_id] || "0.0" 
        }));

        res.status(200).json({ success: true, products: productsWithRatings });

    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ success: false, message: 'Database error' });
    }
};
