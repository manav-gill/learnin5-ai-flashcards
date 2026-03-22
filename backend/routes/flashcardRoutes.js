import { Router } from "express";
import {
	generateFlashcard,
	getFlashcardTest,
} from "../controllers/flashcardController.js";

const flashcardRoutes = Router();

flashcardRoutes.get("/test", getFlashcardTest);
flashcardRoutes.post("/generate", generateFlashcard);

export default flashcardRoutes;
