import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes";

const app = express();

app.use(cors());
app.use(express.json());

/**
 * 健康检查接口
 */
app.get("/api/chat/health", (req, res) => {
  res.json({
    ok: true,
    message: "server is running",
  });
});

/**
 * 聊天相关接口
 */
app.use("/api/chat", chatRoutes);

export default app;