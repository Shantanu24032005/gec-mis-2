import express from "express"
import { adminRegister } from "../controller/adminauth.controller.js";

const router = express.Router();

router.post('/adminRegister',adminRegister)

export default router;