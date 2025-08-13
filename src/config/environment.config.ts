import { cleanEnv, str } from "envalid";
import dotenv from "dotenv";

dotenv.config();

const env = cleanEnv(process.env, {
  EASYBROKER_API_KEY: str(),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: str(),
  GOOGLE_PRIVATE_KEY: str(),
});

export default env;
