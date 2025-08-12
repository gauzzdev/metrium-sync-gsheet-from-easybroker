import { cleanEnv, str } from "envalid";
import dotenv from "dotenv";
import { errorMessages } from "../core/constants/messages.constants";

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
        if (Object.keys(errors).length > 0) throw new Error(errorMessages.missingEnv);
      },
    }
  );
};

export default getEnv;
