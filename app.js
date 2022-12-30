/* eslint-disable no-unused-vars */
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
var csrf = require("tiny-csrf");

const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStrategy = require("passport-local");

app.use(bodyParser.json());

// seting the ejs is the engine
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));

app.use(cookieParser("ssh!!!! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my-super-secret-key-21728172615261562",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, //24hrs
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({ where: { email: username, password: password } })
        .then((user) => {
          return done(null, user);
        })
        .catch((error) => {
          return error;
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

const { Todo, User } = require("./models");

app.get("/", async (request, response) => {
    response.render("index", {
     title: "TO DO Application",
      csrfToken: request.csrfToken(),
    });
});

app.get("/todos", connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  const allTodos = await Todo.getTodos();
  const overdue = await Todo.overdue();
  const dueToday = await Todo.dueToday();
  const dueLater = await Todo.dueLater();
  const completedItems = await Todo.completedItems();
  if (request.accepts("html")) {
    response.render("todos", {
      title: "TO DO Application",
      allTodos,
      overdue,
      dueToday,
      dueLater,
      completedItems,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({ allTodos, overdue, dueToday, dueLater });
  }
});

//Signup page
app.get("/signup", (request, response) => {
  response.render("signup", {
    title: "Sign Up",
    csrfToken: request.csrfToken(),
  });
});

app.post("/users", async (request, response) => {
  console.log("Firstname", request.body.firstName);
  // Have to create the user here
  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: request.body.password,
    });
    request.login(user, (err) => {
      if(err){
        console.log(err)
      }
      response.redirect("/todos");
    })
  } catch (error) {
    console.log(error);
  }
});

//login page
app.get("/login", (request, response) => {
  response.render("login", {
    title: "Login",
    csrfToken: request.csrfToken(),
  });
});

app.get("/todos", (request, response) => {
  console.log("Todo List", request.body);
});
app.post("/todos", async (request, response) => {
  console.log("Todo List");
  try {
    console.log("entering in try block");
    const todo = await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
    });
    return response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id", async (request, response) => {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const upTodo = await todo.setCompletionStatus(request.body.completed);
    return response.json(upTodo);
  } catch (error) {
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {
  const deleteFlag = await Todo.destroy({ where: { id: request.params.id } });
  response.send(deleteFlag ? true : false);
});

module.exports = app;
