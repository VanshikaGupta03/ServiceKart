const db = require("../database");


exports.addAddress = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized! Token missing or invalid." });
        }
        const user_id = req.user.id;
        console.log(user_id);

        

        const {  address_type, house_area, landmark, person_name, longitude, latitude } = req.body;

        if (!user_id || !address_type || !house_area || !landmark || !person_name || !longitude || !latitude) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const [insertResult] = await db.query(
            "INSERT INTO addresses (user_id, address_type, house_area, landmark, person_name, longitude, latitude,status) VALUES (?, ?, ?, ?, ?, ?, ?,?)",
            [user_id, address_type, house_area, landmark, person_name, longitude, latitude,"1"]
        );

        res.status(201).json({ 
            message: "Address added successfully", 
            address_id: insertResult.insertId 
        });

    } catch (error) {
        console.error("Add Address Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getAddresses = async (req, res) => {
    try {
        
        const user_id = req.user.id; 

       
        const [addresses] = await db.query("SELECT * FROM addresses WHERE user_id = ? and status='1'", [user_id]);

        res.status(200).json({ addresses });

    } catch (error) {
        console.error("Fetch Addresses Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.updateAddress = async (req, res) => {
    try {
        const user_id = req.user.id; 
        const { address_id } = req.params; 
        const { address_type, house_area, landmark, person_name, longitude, latitude } = req.body;

        if (!address_type || !house_area || !landmark || !person_name || !longitude || !latitude) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        const [existingAddress] = await db.query("SELECT * FROM addresses WHERE id = ? AND user_id = ?", [address_id, user_id]);
        if (existingAddress.length === 0) {
            return res.status(404).json({ message: "Address not found or unauthorized access." });
        }

        await db.query(
            "UPDATE addresses SET address_type = ?, house_area = ?, landmark = ?, person_name = ?, longitude = ?, latitude = ? WHERE id = ? AND user_id = ?",
            [address_type, house_area, landmark, person_name, longitude, latitude, address_id, user_id]
        );

        res.status(200).json({ message: "Address updated successfully!" });

    } catch (error) {
        console.error("Update Address Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const user_id = req.user.id; 
        const { address_id } = req.params; 

       
        const [existingAddress] = await db.query("SELECT * FROM addresses WHERE id = ? AND user_id = ?", [address_id, user_id]);
        if (existingAddress.length === 0) {
            return res.status(404).json({ message: "Address not found or unauthorized access." });
        }

        
        await db.query("update addresses set status='2' WHERE id = ? AND user_id = ?", [address_id, user_id]);

        res.status(200).json({ message: "Address deleted successfully!" });

    } catch (error) {
        console.error("Delete Address Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

