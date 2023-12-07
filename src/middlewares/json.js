export async function json(req, res) {
  const buffers = []

  for await (const chunk of req) {
    buffers.push(chunk)
  }

  try {
    if (req.headers["content-type"].includes("application/json")) {
      req.body = JSON.parse(Buffer.concat(buffers).toString())
    }

    if (req.headers["content-type"].includes("multipart/form-data")) {
      const boundary = req.headers["content-type"].split("boundary=")[1]
      const data = Buffer.concat(buffers).toString()

      const parts = data.split(`--${boundary}`)

      const csvPart = parts.find((part) => part.includes("filename"))

      if (!csvPart) {
        return res.writeHead(400).end("CSV file is required")
      }

      const csvData = csvPart.split("\r\n\r\n")[1].trim()
      const csvBuffer = Buffer.from(csvData, "binary")

      req.body = {
        file: csvBuffer,
      }
    }
  } catch (error) {
    req.body = null
  }

  res.setHeader("Content-type", "application/json")
}
