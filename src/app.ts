import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import routes from "./routes";
import { logger } from "./lib/logger";

export const app = express();

app.use(cors());

app.use(
express.json({
limit: "25mb",
})
);

app.use(
express.urlencoded({
extended: true,
limit: "25mb",
})
);

app.use(
pinoHttp({
logger,
})
);

app.get("/", (_req, res) => {
res.type("text/plain").send("Fluent English Renderer is running.");
});

app.use("/api", routes);

export default app;
