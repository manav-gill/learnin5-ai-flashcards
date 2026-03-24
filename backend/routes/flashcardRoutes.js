import { Router } from "express";
import {
	generateFlashcard,
	getMyFlashcards,
	getFlashcardTest,
	saveFlashcards,
} from "../controllers/flashcardController.js";
import { protect } from "../middleware/authMiddleware.js";

const flashcardRoutes = Router();

flashcardRoutes.get("/test", getFlashcardTest);
flashcardRoutes.post("/generate", protect, generateFlashcard);
flashcardRoutes.post("/save", protect, saveFlashcards);
flashcardRoutes.get("/my", protect, getMyFlashcards);

export default flashcardRoutes;
