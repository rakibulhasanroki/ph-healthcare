import app from "./app";

const main = () => {
  try {
    app.listen(5000, () => {
      console.log(`Server is running on http://localhost:5000`);
    });
  } catch (err) {
    console.log("Failed to start server", err);
  }
};

main();
