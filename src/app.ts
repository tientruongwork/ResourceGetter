import express, { Express } from "express";
import { youtubeRoute } from "./routes/youtubeDownloadRoute";
import { pinterestRoute } from "./routes/pinterestDownloadRoute";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";

const app: Express = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    exposedHeaders: ["Content-Disposition"],
  })
);
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use(express.static(path.join(__dirname, "../public")));

app.use("/youtube", youtubeRoute);
app.use("/pinterest", pinterestRoute);

app.get("/", (_, response) => {
  response.render("../public/index.html");
});

app.listen(PORT, () => {
  console.log(`Application is running on port:${PORT}`);
});
