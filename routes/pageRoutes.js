const express = require("express");
const router = express.Router();
const pageController = require("../controllers/pageController");

// Define Routes
router.get("/login", pageController.renderIndex);
router.get("/dashboard", pageController.renderDashboard);
router.get("/admin_", pageController.renderAdmin);
router.get("/user", pageController.renderUser);
router.get("/class", pageController.renderClass);
router.get("/chapter", pageController.renderChapter);
router.get("/subject", pageController.renderSubject);
router.get("/settings/setting1", pageController.renderSetting1);
router.get("/settings/setting2", pageController.renderSetting2);
router.get("/report", pageController.renderReport);
router.get("/quiz", pageController.renderQuiz);
router.get("/question", pageController.renderQuestion);

module.exports = router;
