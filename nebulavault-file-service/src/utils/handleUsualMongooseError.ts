function handleUsualMongooseErrors(err, res) {
  if (err.code === 11000) {
    return res.status(400).json({
      message: `Duplication Key Error: ${err.message}`,
      type: "DUPLICATION",
      error: err,
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: `Validation Error: ${err.message}`,
      type: "VALIDATION",
      error: err,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      message: `Cast Error: ${err.type} : ${err.value}`,
      type: "CAST",
      error: err,
    });
  }

  return res.status(500).json({
    message: `Internal Server Error: ${err.message}`,
    type: "SERVER",
    error: err,
  });
}

module.exports = { handleUsualMongooseErrors };
