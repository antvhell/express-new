import express from "express";

const router = express.Router();
router.get("/", function (req, res) {
  res.send("Hola mundo en express");
});

router.get("/nosotros", function (req, res) {
  res.send("Informacion de nosotros");
});

export default router;
