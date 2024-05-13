const express = require('express');
const router = express.Router();
const controller = require("../../controllers/currency_types/currency_type_controller")
 
router.get("/", controller.get_all_types);

router.get("/:id", controller.get_type_by_id);

router.post("/", controller.create_type);
router.put("/:id", controller.update_type);
router.delete("/:id", controller.delete_type);
module.exports = router;