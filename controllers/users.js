const db = require("../database");


exports.registerUser = async (req, res) => {
    try {
        const { first_name, last_name, phone, gender, email, dob } = req.body;
        const profileImage = req.file ? req.file.filename : null;

        const user_id = req.user?.id; 

        if (!user_id) {
            return res.status(401).json({ error: "Unauthorized: User ID missing from token" });
        }
        
        if (!first_name || !last_name || !phone || !gender || !email || !dob) {
            return res.status(400).json({ error: "All fields are required!" });
        }

       
        if (!["male", "female"].includes(gender.toLowerCase())) {
            return res.status(400).json({ error: "Gender must be 'male' or 'female'!" });
        }

        
        if (!email.includes("@")) {
            return res.status(400).json({ error: "Invalid email format!" });
        }

       
        const [existingUser] = await db.query("SELECT * FROM users WHERE email = ? ", [email]);

        if (existingUser.length > 0) {
            return res.status(400).json({ error: "Email or phone number already registered!" });
        }

        
        await db.query(
            "INSERT INTO users (first_name, last_name, phone, gender, email, dob, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [first_name, last_name, phone, gender.toLowerCase(), email, dob, profileImage]
        );

        res.status(201).json({ message: "User registered successfully!" });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
};









exports.updateProfile = async (req, res) => {
    try {
        
        const user_id = req.user.id; 

        const { first_name, last_name, phone, gender, email, dob, profile_image } = req.body;

       
        if (!user_id) {
            return res.status(400).json({ message: "User ID is required!" });
        }

        const [existingProfile] = await db.query("SELECT * FROM users WHERE id = ?", [user_id]);
        if (existingProfile.length === 0) {
            return res.status(404).json({ message: "Profile not found!" });
        }

        
        if (phone) {
            const [phoneExists] = await db.query("SELECT id FROM users WHERE phone = ? AND id != ?", [phone, user_id]);
            if (phoneExists.length > 0) {
                return res.status(400).json({ message: "Phone number is already registered!" });
            }
        }

       
        if (email) {
            const [emailExists] = await db.query("SELECT id FROM users WHERE email = ? AND id != ?", [email, user_id]);
            if (emailExists.length > 0) {
                return res.status(400).json({ message: "Email is already registered!" });
            }
        }

        
        if (gender && !["male", "female"].includes(gender.toLowerCase())) {
            return res.status(400).json({ message: "Gender must be 'male' or 'female'!" });
        }

       
        const fieldsToUpdate = [];
        const values = [];

        if (first_name) {
            fieldsToUpdate.push("first_name = ?");
            values.push(first_name);
        }
        if (last_name) {
            fieldsToUpdate.push("last_name = ?");
            values.push(last_name);
        }
        if (phone) {
            fieldsToUpdate.push("phone = ?");
            values.push(phone);
        }
        if (gender) {
            fieldsToUpdate.push("gender = ?");
            values.push(gender.toLowerCase());
        }
        if (email) {
            fieldsToUpdate.push("email = ?");
            values.push(email);
        }
        if (dob) {
            fieldsToUpdate.push("dob = ?");
            values.push(dob);
        }
        if (profile_image) {
            fieldsToUpdate.push("profile_image = ?");
            values.push(profile_image);
        }
        

        
        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({ message: "No updates provided!" });
        }

        values.push(user_id); 

        
        const updateQuery = `UPDATE users SET ${fieldsToUpdate.join(", ")} WHERE id = ?`;
        const [updateResult] = await db.query(updateQuery, values);

        if (updateResult.affectedRows === 0) {
            return res.status(400).json({ message: "No changes were made!" });
        }

      
        const [updatedProfile] = await db.query("SELECT * FROM users WHERE id = ?", [user_id]);

        res.status(200).json({
            message: "Profile updated successfully!",
            profile: updatedProfile[0]
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};




exports.deleteProfile = async (req, res) => {
    try {
       
        const user_id = req.user.id;

   
        const [existingUser] = await db.query("SELECT * FROM users WHERE id = ?", [user_id]);
        if (existingUser.length === 0) {
            return res.status(404).json({ message: "User not found!" });
        }

      
        const [deleteResult] = await db.query("DELETE FROM users WHERE id = ?", [user_id]);

        if (deleteResult.affectedRows === 0) {
            return res.status(400).json({ message: "User deletion failed." });
        }

        res.status(200).json({ message: "User deleted successfully." });

    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
