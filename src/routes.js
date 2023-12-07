import { randomUUID } from "node:crypto"
import { Database } from "./database.js"
import { buildRoutePath } from "./utils/build-route-path.js"
import { csvParse } from "./utils/csv-parse.js"

const database = new Database()

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query

      const tasks = database.select(
        "tasks",
        search
          ? {
              title: search,
              description: search,
            }
          : null
      )
      return res.end(JSON.stringify(tasks))
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      if (req.headers["content-type"].includes("multipart/form-data")) {
        const csvFile = req.body.file

        csvParse(csvFile, database)

        return res.writeHead(201).end()
      }

      if (req.body === null) {
        return res.writeHead(400).end("Body is required")
      }

      const { title, description } = req.body

      if (!title || !description) {
        return res.writeHead(400).end("Title and description are required")
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      database.insert("tasks", task)

      return res.writeHead(201).end()
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params
      const { title, description } = req.body

      if (!title || !description) {
        return res.writeHead(400).end("Title and description are required")
      }

      const isSuccessReq = database.update("tasks", id, {
        title,
        description,
        updated_at: new Date().toISOString(),
      })

      if (!isSuccessReq) {
        return res.writeHead(404).end("Task not found")
      }

      return res.writeHead(204).end()
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params

      const isSuccessReq = database.update("tasks", id, {
        completed_at: new Date().toISOString(),
      })

      if (!isSuccessReq) {
        return res.writeHead(404).end("Task not found")
      }

      return res.writeHead(204).end()
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params

      const isSuccessReq = database.delete("tasks", id)

      if (!isSuccessReq) {
        return res.writeHead(404).end("Task not found")
      }

      return res.writeHead(204).end()
    },
  },
]
