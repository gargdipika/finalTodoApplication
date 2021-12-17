const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");

const isValid = require("date-fns/isValid");
const format = require("date-fns/format");
const parseISO = require("date-fns/parseISO");

let db = null;

initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const checkValidStatus = (request, response, next) => {
  const { status } = request.query;
  if (
    status === "TO DO" ||
    status === "IN PROGRESS" ||
    status === "DONE" ||
    status === undefined
  ) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
};

const checkValidPriority = (request, response, next) => {
  const { priority } = request.query;
  if (
    priority === "HIGH" ||
    priority === "MEDIUM" ||
    priority === "LOW" ||
    priority === undefined
  ) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
};

const checkValidCategory = (request, response, next) => {
  const { category } = request.query;
  if (
    category === "WORK" ||
    category === "HOME" ||
    category === "LEARNING" ||
    category === undefined
  ) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Category");
  }
};

const checkValidStatusFromRequestBody = (request, response, next) => {
  const { status } = request.body;
  if (
    status === "TO DO" ||
    status === "IN PROGRESS" ||
    status === "DONE" ||
    status === undefined
  ) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
};

const checkValidPriorityFromRequestBody = (request, response, next) => {
  const { priority } = request.body;
  if (
    priority === "HIGH" ||
    priority === "MEDIUM" ||
    priority === "LOW" ||
    priority === undefined
  ) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
};

const checkValidCategoryFromRequestBody = (request, response, next) => {
  const { category } = request.body;
  if (
    category === "WORK" ||
    category === "HOME" ||
    category === "LEARNING" ||
    category === undefined
  ) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Category");
  }
};

const checkValidDateFromBody = (request, response, next) => {
  const { dueDate } = request.body;
  const isValidCheck = isValid(parseISO(dueDate));
  if (isValidCheck) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
};

const checkValidDate = (request, response, next) => {
  const { date } = request.query;
  const isValidCheck = isValid(parseISO(date));
  if (isValidCheck) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
};

//API 1 handel query parameter
app.get(
  "/todos/",
  checkValidStatus,
  checkValidPriority,
  checkValidCategory,
  async (request, response) => {
    const {
      status = "",
      priority = "",
      category = "",
      search_q = "",
    } = request.query;

    const getTodoQuery = `
SELECT * FROM todo
WHERE status LIKE "%${status}%"
AND priority LIKE "%${priority}%"
AND category LIKE "%${category}%"
AND todo LIKE "%${search_q}%"
`;

    const detailsTodoList = await db.all(getTodoQuery);
    response.send(
      detailsTodoList.map((eachTodo) => ({
        id: eachTodo.id,
        todo: eachTodo.todo,
        priority: eachTodo.priority,
        status: eachTodo.status,
        category: eachTodo.category,
        dueDate: eachTodo.due_date,
      }))
    );
  }
);

//API 2 get todo item
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const detailsOfTodoQuery = `
    SELECT * FROM todo
    WHERE id = ${todoId};`;
  const todoListItem = await db.get(detailsOfTodoQuery);
  response.send({
    id: todoListItem.id,
    todo: todoListItem.todo,
    priority: todoListItem.priority,
    status: todoListItem.status,
    category: todoListItem.category,
    dueDate: todoListItem.due_date,
  });
});

//API 3 return todo list specified due date
app.get("/agenda/", checkValidDate, async (request, response) => {
  const { date } = request.query;
  const dueDateInProperFormat = format(parseISO(date), "yyyy-MM-dd");
  console.log(dueDateInProperFormat);
  const getTodoListQuery = `
    SELECT id, todo, priority, status, category, due_date AS dueDate
    FROM todo
    WHERE due_date = '${dueDateInProperFormat}'`;
  const getTodoList = await db.all(getTodoListQuery);
  console.log(getTodoList);
  response.send(getTodoList);
});

//API 4 create todo item
app.post(
  "/todos/",
  checkValidStatusFromRequestBody,
  checkValidPriorityFromRequestBody,
  checkValidCategoryFromRequestBody,
  checkValidDateFromBody,
  async (request, response) => {
    const { id, todo, priority, status, category, dueDate } = request.body;
    const dueDateInProperFormat = format(parseISO(dueDate), "yyyy-MM-dd");
    const createTodoItemQuery = `
    INSERT INTO todo (id, todo, priority, status, category, due_date)
    VALUES
    (${id}, '${todo}', '${priority}', '${status}', '${category}', '${dueDateInProperFormat}');`;

    const creatingTodo = await db.run(createTodoItemQuery);
    console.log(creatingTodo);
    response.send("Todo Successfully Added");
  }
);

//API 5 update todo item
app.put(
  "/todos/:todoId/",
  checkValidStatusFromRequestBody,
  checkValidPriorityFromRequestBody,
  checkValidCategoryFromRequestBody,
  checkValidDateFromBody,
  async (request, response) => {
    const { todoId } = request.params;
    const { status, priority, todo, category, dueDate } = request.body;
    console.log(status);
    console.log(priority);
    console.log(todoId);
    if (
      priority === undefined &&
      todo === undefined &&
      category === undefined &&
      dueDate === undefined &&
      status !== undefined
    ) {
      const statusUpdateQuery = `
      UPDATE todo 
      SET 
        status = '${status}'
      WHERE 
        id = ${todoId};`;
      await db.run(statusUpdateQuery);
      response.send("Status Updated");
    } else if (
      status === undefined &&
      todo === undefined &&
      category === undefined &&
      dueDate === undefined &&
      priority !== undefined
    ) {
      const priorityUpdateQuery = `
      UPDATE todo 
      SET 
        priority = '${priority}'
      WHERE 
        id = ${todoId};`;
      await db.run(priorityUpdateQuery);
      response.send("Priority Updated");
    } else if (
      status === undefined &&
      priority === undefined &&
      category === undefined &&
      dueDate === undefined &&
      todo !== undefined
    ) {
      const todoUpdateQuery = `
      UPDATE todo 
      SET 
        todo = '${todo}'
      WHERE 
        id = ${todoId};`;
      await db.run(todoUpdateQuery);
      response.send("Todo Updated");
    } else if (
      status === undefined &&
      priority === undefined &&
      todo === undefined &&
      dueDate === undefined &&
      category !== undefined
    ) {
      const todoUpdateQuery = `
      UPDATE todo 
      SET 
        category = '${category}'
      WHERE 
        id = ${todoId};`;
      await db.run(todoUpdateQuery);
      response.send("Category Updated");
    } else if (
      status === undefined &&
      priority === undefined &&
      todo === undefined &&
      category === undefined &&
      dueDate !== undefined
    ) {
      const formattedDate = format(parseISO(dueDate), "yyyy-MM-dd");
      const todoUpdateQuery = `
      UPDATE todo 
      SET 
        due_date = '${formattedDate}'
      WHERE 
        id = ${todoId};`;
      await db.run(todoUpdateQuery);
      response.send("Due Date Updated");
    }
  }
);

//API 6 delete todo item
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoItem = `
    DELETE FROM todo
    WHERE id = ${todoId};`;
  await db.run(deleteTodoItem);
  response.send("Todo Deleted");
});

module.exports = app;
