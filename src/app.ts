import express, { Express } from "express";
import { youtubeRoute } from "./routes/youtubeDownloadRoute";
import bodyParser from "body-parser";
import cors from "cors";

const app: Express = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use("/youtube", youtubeRoute);

app.listen(PORT, () => {
  console.log(`Application is running on port:${PORT}`);
});
