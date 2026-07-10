// src/index.ts

import app from "./app";
import { envVars } from "./config/env";

const bootstrap = () => {
  app.listen(envVars.PORT || 5000, () => {
    console.log(
      `🚀 SalesNexus Server is running on http://localhost:${envVars.PORT || 5000}`,
    );
    console.log(
      `📊 Health Check: http://localhost:${envVars.PORT || 5000}/health`,
    );
    console.log(`⚡ Environment: ${envVars.NODE_ENV || "development"}`);
  });
};
bootstrap();
