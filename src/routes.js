import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js';


const database = new Database()

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) =>{
      const { title, description } = req.query

      let tasks = database.select('tasks')

      if(title) tasks = tasks.filter((task) => task.title.includes(title))
      if (description) tasks = tasks.filter((task) => task.description.includes(description));

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: "POST",
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body;

      const task = {
        id: randomUUID(),
        title: title,
        description: description
      }

      database.insert('tasks', task)

      return res.end()
    }
  }
]