const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const auth = require("../middleware/auth");

router.get("/seeproducts", auth, getProducts); // GET /api/seeproducts
router.get("/seeoneproduct/:id", auth, getProduct); // GET /api/seeoneproduct/:id
router.post("/addproduct", auth, createProduct); // POST /api/addproduct
router.put("/updateproduct/:id", auth, updateProduct); // PUT /api/updateproduct/:id
router.delete("/deleteproduct/:id", auth, deleteProduct); // DELETE /api/deleteproduct/:id

module.exports = router;
