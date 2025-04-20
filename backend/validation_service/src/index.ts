import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { validateConfig } from "./validate-config";
import cors from "cors";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({
    message: "Validation Service is running",
  });
});

app.post("/validate", async (req: Request, res: Response): Promise<any> => {
  const { config } = req.body;

  if (!config) {
    return res.status(400).json({ error: "Configuration file is required" });
  }

  try {
    const isValid = await validateConfig(config);
    if (isValid) {
      res
        .status(200)
        .json({ success: true, message: "Configuration is valid" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Configuration is invalid" });
    }
  } catch (error: any) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Validation Service is running on port ${process.env.PORT}`);
});
