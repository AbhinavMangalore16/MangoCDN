const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;
const ORIGIN_NAME = process.env.ORIGIN_NAME || "origin-1";
const BASE_DELAY = Number(process.env.BASE_DELAY || 400);

app.use((req, res, next) => {
  const start = Date.now();

  console.log(
    `[ORIGIN:${ORIGIN_NAME}] ${req.method} ${req.url} (from ${req.ip})`
  );

  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(
      `[ORIGIN:${ORIGIN_NAME}] -> ${res.statusCode} (${ms}ms) ${req.method} ${req.url}`
    );
  });

  next();
});

app.use((req, res, next) => {
  setTimeout(next, BASE_DELAY);
});

app.get("/:id", (req, res) => {
  const id = req.params.id;
  res.set("Cache-Control", "public, max-age=60");

  res.json({
    id,
    type: "cacheable",
    payload: "x".repeat(1024),
    origin: ORIGIN_NAME,
    timestamp: Date.now(),
  });
});


app.get("/nocache/:id", (req, res) => {
  const id = req.params.id;

  res.set("Cache-Control", "no-store");

  res.json({
    id,
    type: "non-cacheable",
    secret: `private-data-for-${id}`,
    origin: ORIGIN_NAME,
    timestamp: Date.now(),
  });
});

app.get("/big/:id", (req, res) => {
  const id = req.params.id;
  const kb = Math.min(Number(req.query.kb || 256), 2048); 

  res.set("Cache-Control", "public, max-age=120");

  res.json({
    id,
    type: "big-cacheable",
    sizeKB: kb,
    payload: "x".repeat(kb * 1024),
    origin: ORIGIN_NAME,
    timestamp: Date.now(),
  });
});

app.get("/", (req, res) => {
  res.send("MangoCDN Origin is running ✅");
});

app.listen(PORT, () => {
  console.log(`[ORIGIN:${ORIGIN_NAME}] running on port ${PORT}`);
});
