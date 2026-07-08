// src/index.ts

import app from "./app";

const bootstrap = () => {
  app.listen(process.env.PORT || 5000, () => {
    console.log(
      `🚀 SalesNexus Server is running on http://localhost:${process.env.PORT || 5000}`,
    );
    console.log(
      `📊 Health Check: http://localhost:${process.env.PORT || 5000}/health`,
    );
    console.log(`⚡ Environment: ${process.env.NODE_ENV || "development"}`);
  });
};
bootstrap();
