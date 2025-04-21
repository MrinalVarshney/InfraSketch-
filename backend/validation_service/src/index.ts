import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { validateConfig } from "./validate-config";

dotenv.config();
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Validation Service is running",
  });
});

app.post("/validate", async (req: Request, res: Response): Promise<any> => {
  const { config } = req.body;

  console.log(config);
  if (!config) {
    return res.status(400).json({ error: "Configuration file is required" });
  }

  try {
    const response = await validateConfig(config);
    res.status(200).json(response);
  } catch (error: any) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

app.listen(process.env.PORT || 5001, () => {
  console.log(`Validation Service is running on port ${process.env.PORT}`);
});
