const parsePort = (value) => {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : 5000;
};

const readTrimmedEnv = (key) => {
	const value = process.env[key];
	return typeof value === "string" ? value.trim() : "";
};

export const PORT = parsePort(process.env.PORT);
export const MONGO_URI = readTrimmedEnv("MONGO_URI") || readTrimmedEnv("MONGODB_URL");
export const JWT_SECRET = readTrimmedEnv("JWT_SECRET");
export const GEMINI_API_KEY = readTrimmedEnv("GEMINI_API_KEY");
