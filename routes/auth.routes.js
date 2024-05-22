import express from "express";
import {
  login,
  logout,
  signup,
  changePassword,
  verifyOTP,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controllers.js";
import protectRoute from "../middleware/protectedRoute.js";

const router = express.Router();

router.post("/signup", signup);

// router.post('/sendOtp', sendOtp)

router.post("/login", login);

router.post("/logout", logout);
router.post("/change-password", changePassword);
router.post("/activateUser", verifyOTP);
router.patch("/verifyotp", verifyOTP);
router.post("/forgot-password", forgotPassword);
router.post("/resetPassword/:resetToken", resetPassword);

export default router;
