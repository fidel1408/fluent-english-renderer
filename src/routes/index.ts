import { Router, type IRouter } from "express";
import healthRouter from "./health";
import renderSlideRouter from "./render-slide";

const router: IRouter = Router();

router.use(healthRouter);
router.use(renderSlideRouter);

export default router;
