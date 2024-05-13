const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);
// Upload Image Middleware
app.use("/uploads", express.static("uploads"));

app.use("/upload-image", require("./app/utils/multer/image-uploader"));
app.use("/upload-image-simple", require("./app/utils/multer/image-upload-simple"));
app.use("/upload-pdf", require("./app/utils/multer/upload-pdf"));


const PORT = 4000;

// Routes
app.get("/", (req, res) => {
  res.send({
    error: false,
    message: "Server is Running Fine!",
  });
});
// Other routes will be added here
app.use("/users", require("./app/routes/user/user-routes"));
app.use(
  "/currency_type",
  require("./app/routes/currency_types_routes.js/currency_types")
);
app.use(
  "/payment_terms",
  require("./app/routes/payment_terms_routes/payment_terms")
);
app.use("/vendor", require("./app/routes/vendor_routes/vendor"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Something went wrong!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`---------------------------------------`);
  console.log(`----Server is running on port ${PORT}.--`);
  console.log(`---------------------------------------`);
});

module.exports = app;
