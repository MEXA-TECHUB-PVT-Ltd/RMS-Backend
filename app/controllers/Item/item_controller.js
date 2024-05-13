const { pool } = require("../../config/db.config");
const fs = require("fs");
const path = require("path");
exports.create_vendor = async (req, res) => {
  const {
    item_types,
    name,
    product_category,
    product_units,
    product_usage_units,
    product_catalog,
    preferred_vendor,
    track_inventory,
    opening_stock,
    opening_stock_rate_per_unit,
    reorder_level,
    description,
    product_image,
  } = req.body;
  const client = await pool.connect();
  try {
    let userData;
    if (item_types === "service") {
      userData = await pool.query(
        `INSERT INTO item( 
          item_types,
          name,
          preferred_vendor,
          description
        ) VALUES($1,$2,$3,$4) 
           returning *`,
        [item_types, name, preferred_vendor, description]
      );
    } else {
      userData = await pool.query(
        `INSERT INTO item( 
            item_types,
            name,
            product_category,
            product_units,
            product_usage_units,
            product_catalog,
            preferred_vendor,
            track_inventory,
            opening_stock,
            opening_stock_rate_per_unit,
            reorder_level,
            description,
            product_image) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) 
             returning *`,
        [
          item_types,
          name,
          product_category,
          product_units,
          product_usage_units,
          product_catalog,
          preferred_vendor,
          track_inventory,
          opening_stock,
          opening_stock_rate_per_unit,
          reorder_level,
          description,
          product_image,
        ]
      );
    }

    res.status(201).json({
      error: false,
      message: "Item created successfully",
      data: userData.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      error_obj: err,
      message: "Internal server error",
    });
  } finally {
    client.release();
  }
};
exports.delete_cnic_image = async (req, res) => {
  const client = await pool.connect();
  const { item_id, image_id } = req.body;
  try {
    // Get the current cnic_image array
    const { rows } = await client.query(
      "SELECT * FROM item WHERE item_id = $1",
      [item_id]
    );
    let ArrayImage = rows[0].product_image;
    console.log(ArrayImage);

    if (ArrayImage.length === 0) {
      return res.status(404).json({ error: true, message: "Item not found" });
    }

    // Convert the JSONB array to a normal array and remove the specified element
    const cnic_image = ArrayImage.filter(
      (image) => image.id !== parseInt(image_id)
    );

    // Update the cnic_image array
    await client.query(
      "UPDATE item SET product_image = $1 WHERE item_id = $2",
      [cnic_image, item_id]
    );

    return res.status(200).json({
      error: false,
      message: " image deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: true, error_obj: err, message: "Internal server error" });
  } finally {
    client.release();
  }
};

exports.update_vendor = async (req, res) => {
  const {
    item_types,
    name,
    product_category,
    product_units,
    product_usage_units,
    product_catalog,
    preferred_vendor,
    track_inventory,
    opening_stock,
    opening_stock_rate_per_unit,
    reorder_level,
    description,
    product_image,
  } = req.body;
  const { id } = req.params;
  const client = await pool.connect();
  try {
    let updateQuery = "UPDATE item SET ";
    let updateValues = [];
    let index = 1;

    const fields = {
      item_types,
      name,
      product_category,
      product_units,
      product_usage_units,
      product_catalog,
      preferred_vendor,
      track_inventory,
      opening_stock,
      opening_stock_rate_per_unit,
      reorder_level,
      description,
      product_image,
    };

    for (let [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updateQuery += `${key}=$${index}, `;
        updateValues.push(value);
        index++;
      }
    }

    // Remove the last comma and space
    updateQuery = updateQuery.slice(0, -2);

    updateQuery += ` WHERE item_id=$${index} returning *`;
    updateValues.push(id);

    const userData = await pool.query(updateQuery, updateValues);

    if (userData.rowCount === 0) {
      res.status(404).json({ error: true, message: "Item not found" });
    } else {
      res.status(200).json({
        error: false,
        message: "Item updated successfully",
        data: userData.rows[0],
      });
    }
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      // Unique constraint error
      res
        .status(409)
        .json({ error: true, error_obj: err, message: "Terms already in use" });
    } else {
      res.status(500).json({
        error: true,
        error_obj: err,
        message: "Internal server error",
      });
    }
  } finally {
    client.release();
  }
};
// delete user
exports.delete_vendor = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const userData = await pool.query(
      "DELETE FROM item WHERE item_id=$1 returning *",
      [id]
    );
    if (userData.rowCount === 0) {
      res.status(404).json({ error: true, message: "Item not found" });
    } else {
      res
        .status(200)
        .json({ error: false, message: "Item deleted successfully" });
      // Invalidate cache for this user
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: true, error_obj: err, message: "Internal server error" });
  } finally {
    client.release();
  }
};
// get all users
// get all users
exports.get_all_vendors = async (req, res) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    let userData;
    let totalRecords;
    if (page && limit) {
      const offset = (page - 1) * limit;
      userData = await pool.query(
        "SELECT * FROM item ORDER BY item_id LIMIT $1 OFFSET $2",
        [limit, offset]
      );
      const totalRecordsData = await pool.query("SELECT COUNT(*) FROM item");
      totalRecords = totalRecordsData.rows[0].count;
    } else {
      userData = await pool.query("SELECT * FROM item ORDER BY item_id");
    }
    return res.status(200).json({
      error: false,
      message: "Item fetched successfully",
      data: userData.rows,
      totalRecords: totalRecords,
      page: page,
      limit: limit,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: true, error_obj: err, message: "Internal server error" });
  }
};
// get user by id
exports.get_vendor_by_id = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const userData = await pool.query("SELECT * FROM item WHERE item_id=$1", [
      id,
    ]);
    if (userData.rowCount === 0) {
      res.status(404).json({ error: true, message: "Item not found" });
    } else {
      res.status(200).json({
        error: false,
        message: "Item fetched successfully",
        data: userData.rows[0],
      });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: true, error_obj: err, message: "Internal server error" });
  } finally {
    client.release();
  }
};
// get vendors by vendor types
exports.get_vendors_by_vendor_types = async (req, res) => {
  const { item_types, product_catalog, page, limit } = req.body;
  const offset = (page - 1) * limit;
  const whereClauses = [];
  const values = [];

  if (item_types) {
    whereClauses.push(`item_types=$${values.length + 1}`);
    values.push(item_types);
  }

  if (product_catalog) {
    whereClauses.push(`product_catalog=$${values.length + 1}`);
    values.push(product_catalog);
  }

  const whereClause = whereClauses.length
    ? `WHERE ${whereClauses.join(" AND ")}`
    : "";
  const query = `SELECT item.*, product_catalog.*, vendors.* FROM item 
               LEFT JOIN product_catalog ON item.product_catalog = product_catalog.product_catalog_id::text 
               LEFT JOIN vendors ON item.preferred_vendor = vendors.vendor_id::text 
               ${whereClause} ORDER BY item.item_id LIMIT $${
    values.length + 1
  } OFFSET $${values.length + 2}`;
  // const query = `SELECT * FROM item ${whereClause} ORDER BY item_id LIMIT $${
  //   values.length + 1
  // } OFFSET $${values.length + 2}`;
  values.push(limit, offset);

  try {
    const { rows } = await pool.query(query, values);
    const { rows: totalRows } = await pool.query("SELECT COUNT(*) FROM item");
    const totalRecords = totalRows[0].count;

    res.status(200).json({
      error: false,
      message: "Item fetched successfully",
      data: rows,
      totalRecords,
      page,
      limit,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: true, error_obj: err, message: "Internal server error" });
  }
};
// exports.get_vendors_by_vendor_types = async (req, res) => {
//   const { vendor_types, page, limit,payment_term_id } = req.body;
//   let query = "SELECT * FROM vendors";
//   let values = [];

//   if (vendor_types) {
//     query += " WHERE vendor_types=$1";
//     values.push(vendor_types);
//   }

//   if (page && limit) {
//     const offset = (page - 1) * limit;
//     query += vendor_types ? " ORDER BY vendor_id LIMIT $2 OFFSET $3" : " ORDER BY vendor_id LIMIT $1 OFFSET $2";
//     values.push(limit, offset);
//   }

//   try {
//     const userData = await pool.query(query, values);

//     if (userData.rowCount === 0) {
//       res.status(200).json({
//         error: false,
//         message: "Vendor fetched successfully",
//         data: userData.rows,
//         totalRecords: 0,
//         page: page,
//         limit: limit,
//       });
//     } else {
//       const totalRecordsQuery = vendor_types ? "SELECT COUNT(*) FROM vendors WHERE vendor_types=$1" : "SELECT COUNT(*) FROM vendors";
//       const totalRecordsData = await pool.query(totalRecordsQuery, vendor_types ? [vendor_types] : []);
//       const totalRecords = totalRecordsData.rows[0].count;

//       res.status(200).json({
//         error: false,
//         message: "Vendor fetched successfully",
//         data: userData.rows,
//         totalRecords: totalRecords,
//         page: page,
//         limit: limit,
//       });
//     }
//   } catch (err) {
//     console.error(err);
//     res
//       .status(500)
//       .json({ error: true, error_obj: err, message: "Internal server error" });
//   }
// };
