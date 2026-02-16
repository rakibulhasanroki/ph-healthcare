import app from "./app";
import { env } from "./app/config/env";

const main = () => {
  try {
    app.listen(env.PORT, () => {
      console.log(`Server is running on http://localhost:${env.PORT}`);
    });
  } catch (err) {
    console.log("Failed to start server", err);
  }
};

main();
