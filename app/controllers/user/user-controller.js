const { pool } = require("../../config/db.config");
const { setInCache, getFromCache } = require("../../utils/multer/cache");

exports.create_user = async (req, res) => {
    const { name, email, password } = req.body;
    const client = await pool.connect();
    try {
        const userData = await pool.query("INSERT INTO users(name,email,password) VALUES($1,$2,$3) returning *",
            [
                name,
                email,
                password,
            ])
        res.status(201).json({ error:false,message: "User created successfully", data: userData.rows[0] });
    } catch (err) {
        console.error(err);
        if (err.code === '23505') { // Unique constraint error
            res.status(409).json({ error: true, error_obj: err, message: "User already exists" });
        } else {
            res.status(500).json({ error: true, error_obj: err, message: "Internal server error" });
        }
    } finally {
        client.release();
    }
}
exports.update_user = async (req, res) => {
    const { name, email, password } = req.body;
    const { id } = req.params;
    const client = await pool.connect();
    try {
        let updateQuery = 'UPDATE users SET ';
        let updateValues = [];
        let index = 1;

        if (name) {
            updateQuery += `name=$${index}, `;
            updateValues.push(name);
            index++;
        }
        if (email) {
            updateQuery += `email=$${index}, `;
            updateValues.push(email);
            index++;
        }
        if (password) {
            updateQuery += `password=$${index}, `;
            updateValues.push(password);
            index++;
        }

        // Remove the last comma and space
        updateQuery = updateQuery.slice(0, -2);

        updateQuery += ` WHERE user_id=$${index} returning *`;
        updateValues.push(id);

        const userData = await pool.query(updateQuery, updateValues);

        if (userData.rowCount === 0) {
            res.status(404).json({ error: true, message: "User not found" });
        } else {
            res.status(200).json({ error: false, message: "User updated successfully", data: userData.rows[0] });
        }
    }  catch (err) {
        console.error(err);
        if (err.code === '23505') { // Unique constraint error
            res.status(409).json({ error: true, error_obj: err, message: "Email already in use" });
        } else {
            res.status(500).json({ error: true, error_obj: err, message: "Internal server error" });
        }
    } finally {
        client.release();
    }
}
// delete user
exports.delete_user = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        const userData = await pool.query("DELETE FROM users WHERE user_id=$1 returning *",
            [
                id
            ])
            if (userData.rowCount === 0) {
                res.status(404).json({ error: true, message: "User not found" });
            } else {
                res.status(200).json({ error: false, message: "User deleted successfully" });
                  // Invalidate cache for this user
            }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, error_obj: err, message: "Internal server error" });
    } finally {
        client.release();
    }
}
// get all users
// get all users
exports.get_all_users = async (req, res) => {
    try {
      const page = req.query.page;
      const limit = req.query.limit;
      let userData;
  
      if (page && limit) {
        const offset = (page - 1) * limit;
        const key = `users_${limit}_${offset}`;
        
        getFromCache(key, async (err, data) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: true, error_obj: err, message: "Internal server error" });
          }
          if (data) {
            return res.status(200).json({ error: false, message: "Users fetched successfully", data });
          } else {
            userData = await pool.query("SELECT * FROM users ORDER BY user_id LIMIT $1 OFFSET $2", [limit, offset]);
            setInCache(key, userData.rows, 3600); // cache for 1 hour
            return res.status(200).json({ error: false, message: "Users fetched successfully", data: userData.rows });
          }
        });
      } else {
        return res.status(400).json({ error: true, message: "Page and limit parameters are required" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: true, error_obj: err, message: "Internal server error" });
    }
  }
// get user by id
exports.get_user_by_id = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        const userData = await pool.query("SELECT * FROM users WHERE user_id=$1",
            [
                id
            ])
            if (userData.rowCount === 0) {
                res.status(404).json({ error: true, message: "User not found" });
            } else {
                res.status(200).json({ error: false, message: "User fetched successfully", data: userData.rows[0] });
            }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, error_obj: err, message: "Internal server error" });
    } finally {
        client.release();
    }
}
