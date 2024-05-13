const express = require("express");
const router = express.Router();
const controller = require("../../controllers/user/user-controller.js");

router.get("/", controller.get_all_users);

router.get("/:id", controller.get_user_by_id);

router.post("/", controller.create_user);
router.put("/:id", controller.update_user);
router.delete("/:id", controller.delete_user);
module.exports = router;
