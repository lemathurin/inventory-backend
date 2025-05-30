import { Router } from "express";
import homesRouter from "./homeRoutes";
import itemsRouter from "./itemRoutes";
import roomsRouter from "./roomRoutes";
import authRouter from "./authRoutes";
import usersRouter from "./userRoutes";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/homes", homesRouter);
router.use("/rooms", roomsRouter);
router.use("/items", itemsRouter);

export default router;
