import express, { Express, Request, Response } from "express";
import { youtubeRoute } from "./routes/youtubeDownloadRoute";
import bodyParser from "body-parser";

const app: Express = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use(youtubeRoute);

app.get("/download", (req, res) => {
  console.log(req);
  const file = `./storage/xxyz.mp3`;
  res.download(file);
});

app.get("/", (req: Request, res: Response) => {
  console.log(req.body);
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Application is running on port:${PORT}`);
});
