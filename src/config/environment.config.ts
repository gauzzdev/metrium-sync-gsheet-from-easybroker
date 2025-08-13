import { cleanEnv, str } from "envalid";
import dotenv from "dotenv";
import { userMessages } from "../core/constants/messages.constants";

dotenv.config();

const getEnv = () => {
  return cleanEnv(
    process.env,
    {
      EASYBROKER_API_KEY: str(),
      GOOGLE_SERVICE_ACCOUNT_EMAIL: str(),
      GOOGLE_PRIVATE_KEY: str(),
    },
    {
      reporter: ({ errors }) => {
        if (Object.keys(errors).length > 0) throw new Error(userMessages.errors.missingEnv);
      },
    }
  );
};

export default getEnv;
