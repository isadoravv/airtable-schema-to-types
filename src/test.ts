import { generateTypes } from "./index";

generateTypes("./types")
  .then(() => console.log("Types generated successfully!"))
  .catch((err) => console.error("Error:", err));
