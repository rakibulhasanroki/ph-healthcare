import app from "./app";
import { env } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seed-super-admin";

const main = async () => {
  try {
    await seedSuperAdmin();
    app.listen(env.PORT, () => {
      console.log(`Server is running on http://localhost:${env.PORT}`);
    });
  } catch (err) {
    console.log("Failed to start server", err);
  }
};

main();
