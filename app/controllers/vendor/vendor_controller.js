const { pool } = require("../../config/db.config");

exports.create_vendor = async (req, res) => {
  const {
    vendor_types,
    service_type,
    first_name,
    last_name,
    email,
    phone_number,
    work_number,
    company_name,
    vendor_display_name,
    company_email,
    company_phone_number,
    company_work_number,
    address,
    fax_number,
    state,
    zip_code,
    country,
    city,
    shipping_address,
    currency_id,
    payment_term_id,
    cnic_image,
    agreement_pdf,
  } = req.body;
  const client = await pool.connect();
  try {
    const userData = await pool.query(
      `INSERT INTO vendors( 
        vendor_types,
        service_type,
        first_name,
        last_name,
        email,
        phone_number,
        work_number,
        company_name,
        vendor_display_name,
        company_email,
        company_phone_number,
        company_work_number,
        address,
        fax_number,
        state,
        zip_code,
        country,
        city,
        shipping_address,
        currency_id,
        payment_term_id,
        cnic_image,
        agreement_pdf) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23) 
         returning *`,
      [
        vendor_types,
        service_type,
        first_name,
        last_name,
        email,
        phone_number,
        work_number,
        company_name,
        vendor_display_name,
        company_email,
        company_phone_number,
        company_work_number,
        address,
        fax_number,
        state,
        zip_code,
        country,
        city,
        shipping_address,
        currency_id,
        payment_term_id,
        cnic_image,
        agreement_pdf,
      ]
    );
    res.status(201).json({
      error: false,
      message: "Vendors created successfully",
      data: userData.rows[0],
    });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      // Unique constraint error
      res.status(409).json({
        error: true,
        error_obj: err,
        message: "Vendor already exists",
      });
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
exports.delete_cnic_image = async (req, res) => {
    const client = await pool.connect();  
    const { vendor_id, cnic_id } = req.body;
  try {


    // Get the current cnic_image array
    const { rows } = await client.query(
      "SELECT * FROM vendors WHERE vendor_id = $1",
      [vendor_id]
    );
    let ArrayImage=rows[0].cnic_image
    console.log(ArrayImage)

    if (ArrayImage.length === 0) {
      return res.status(404).json({ error: true, message: "Vendor not found" });
    }

    // Convert the JSONB array to a normal array and remove the specified element
    const cnic_image = ArrayImage.filter((image) => image.id !== parseInt(cnic_id));

    // Update the cnic_image array
    await client.query(
      "UPDATE vendors SET cnic_image = $1 WHERE vendor_id = $2",
      [cnic_image, vendor_id]
    );

    return res.status(200).json({
      error: false,
      message: "Cnic image deleted successfully",
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
exports.delete_agreement_pdf = async (req, res) => {
  const { vendor_id } = req.body;
  let client = await pool.connect();
  try {
    // Check if the vendor exists
    const { rows } = await client.query(
      "SELECT * FROM vendors WHERE vendor_id = $1",
      [vendor_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: true, message: "Vendor not found" });
    }

    // Set the agreement_pdf field to null
    await client.query(
      "UPDATE vendors SET agreement_pdf = NULL WHERE vendor_id = $1",
      [vendor_id]
    );

    return res.status(200).json({
      error: false,
      message: "Agreement PDF deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: true, error_obj: err, message: "Internal server error" });
  } finally {
    if (client) {
      client.release();
    }
  }
};
exports.update_vendor = async (req, res) => {
  const {
    vendor_types,
    service_type,
    first_name,
    last_name,
    email,
    phone_number,
    work_number,
    company_name,
    vendor_display_name,
    company_email,
    company_phone_number,
    company_work_number,
    address,
    fax_number,
    state,
    zip_code,
    country,
    city,
    shipping_address,
    currency_id,
    payment_term_id,
    cnic_image,
    agreement_pdf,
  } = req.body;
  const { id } = req.params;
  const client = await pool.connect();
  try {
    let updateQuery = "UPDATE vendors SET ";
    let updateValues = [];
    let index = 1;

    const fields = {
      vendor_types,
      service_type,
      first_name,
      last_name,
      email,
      phone_number,
      work_number,
      company_name,
      vendor_display_name,
      company_email,
      company_phone_number,
      company_work_number,
      address,
      fax_number,
      state,
      zip_code,
      country,
      city,
      shipping_address,
      currency_id,
      payment_term_id,
      cnic_image,
      agreement_pdf,
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

    updateQuery += ` WHERE vendor_id=$${index} returning *`;
    updateValues.push(id);

    const userData = await pool.query(updateQuery, updateValues);

    if (userData.rowCount === 0) {
      res.status(404).json({ error: true, message: "Payment Terms not found" });
    } else {
      res.status(200).json({
        error: false,
        message: "Terms updated successfully",
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
      "DELETE FROM vendors WHERE vendor_id=$1 returning *",
      [id]
    );
    if (userData.rowCount === 0) {
      res.status(404).json({ error: true, message: "Vendor not found" });
    } else {
      res
        .status(200)
        .json({ error: false, message: "Vendor deleted successfully" });
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
        "SELECT * FROM vendors ORDER BY vendor_id LIMIT $1 OFFSET $2",
        [limit, offset]
      );
      const totalRecordsData = await pool.query("SELECT COUNT(*) FROM vendors");
      totalRecords = totalRecordsData.rows[0].count;
    } else {
      userData = await pool.query("SELECT * FROM vendors ORDER BY vendor_id");
    }
    return res.status(200).json({
      error: false,
      message: "Vendor fetched successfully",
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
    const userData = await pool.query(
      "SELECT * FROM vendors WHERE vendor_id=$1",
      [id]
    );
    if (userData.rowCount === 0) {
      res.status(404).json({ error: true, message: "Vendor not found" });
    } else {
      res.status(200).json({
        error: false,
        message: "Vendor fetched successfully",
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
