export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const status =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({ error: err.message || "Something went wrong" });
};
