export const logger = (req, res, next) => {
  process.stdout.write(`Incoming Request: ${req.method} ${req.url}\n`);
  next();
};
