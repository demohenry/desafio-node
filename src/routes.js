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

      if(!title || !description){
        res.writeHead(400).end(
          JSON.stringify({error: "Title and description are required."})
          )
          return
      }

      const newTask = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      database.insert('tasks', newTask)

      res.writeHead(201).end(JSON.stringify(newTask));
    }
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body

      const updatedTask = {
        ...(title && { title }),
        ...(description && {description}),
        updated_at: new Date().toISOString()
      }
      

      const success = database.update("tasks", id, updatedTask)

      if(success) {
        return res
                .writeHead(200)
                .end(JSON.stringify({ message: "Updated with success"}))
      } else {
        return res
              .writeHead(404)
              .end(JSON.stringify({ message: "Task not found."}))
      }
    }
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;

      const tasks = database.select("tasks");
      const task = tasks.find((task) => task.id === id)

      if(!task) {
        res.writeHead(404).end(JSON.stringify({ error: "Task not found"}))
        return
      }

      const completedTask = {
        title: task.title,
        description: task.description,
        completed_at: task.completed_at ? null : new Date().toISOString(),
        created_at: task.created_at,
        updated_at: new Date().toISOString(),
      }

      const success = database.update("tasks", id, completedTask)

      if(success){
        return res.writeHead(200).end(JSON.stringify({ message: "Task Completed"}))
      }
    }
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params

      const deletedTask = database.delete("tasks", id)

      if(!deletedTask) {
        res.writeHead(404).end(JSON.stringify({ error: "Task not found"}))
        return
      }

      res.writeHead(200).end(JSON.stringify({ message: "Task deleted"}))
    }
  }
]