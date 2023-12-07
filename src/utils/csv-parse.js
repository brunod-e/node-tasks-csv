import { randomUUID } from "node:crypto"
import { Database } from "../database.js"
import { parse } from "csv-parse"
import { Readable, Writable, Transform } from "stream"

export const csvParse = (csvFile, database) => {
  const readableStream = Readable.from(csvFile)
  const transformToObject = parse({ columns: true })
  const transformToString = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      callback(null, JSON.stringify(chunk))
    },
  })
  const writableStreamFile = new Writable({
    write(chunk, encoding, next) {
      const stringifyer = chunk.toString()
      const { title, description } = JSON.parse(stringifyer)
      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log(task)
      database.insert("tasks", task)

      next()
    },
  })

  console.log("Iniciou", Date())
  readableStream
    .pipe(transformToObject)
    .pipe(transformToString)
    .pipe(writableStreamFile)
    .on("close", () => console.log("Finalizou", Date()))
}
