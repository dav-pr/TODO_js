const express = require("express");
const cors = require("cors");
const app = express();
const fs = require("fs");

class todoTask extends Object{
    constructor(id, title, body, completed){
        super();
        this.id = id;
        this.title = title;
        this.body = body;
        this.completed = completed;
    }
}

fs.openSync("db.json", "w");
fs.writeFileSync("db.json", JSON.stringify([]));

app.use(cors());
app.use(express.json());
const path = require('path')
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

function getDataFromJSON(fname){
    let rawdata = fs.readFileSync(fname);
    let content = JSON.parse(rawdata);
    if (content === undefined){
        return undefined
        }
    else{
        let todo_array=[]
        for ( const sub in content){
           
            task = new todoTask(content[sub].id, content[sub].title, content[sub].body, content[sub].completed)
            todo_array.push(task)
            }
        return todo_array
        }  
}

function AddDataToJson(fname, task){
    let rawdata = fs.readFileSync(fname);
    let content = JSON.parse(rawdata);    
    const toWrite = [...content, task];
    fs.writeFileSync(fname, JSON.stringify(toWrite), (err) => {
        if (err) {
            console.error(err);
        }
    });
};

function RenderMain(res, fname, template){
    let todo_array = getDataFromJSON(fname)
    if (todo_array === undefined){    
        res.render(template)
    }
    else{
        res.render(template, {todo_array: todo_array})
    }
}
app.get("/", (req, res, next) => {
    console.log('RenderMain')
    RenderMain(res, "db.json", 'todo.ejs')
});

let id = 1;
app.post("/", async (req, res) => {
    const {title, body, completed} = req.body;
    console.log('app.post/')      
    if (!title) {
        return res.status(400).json({message: "No title in your request"});
    }
    if (!body) {
        return res.status(400).json({message: "No body in your request"});
    }
    let rawdata = fs.readFileSync("db.json");
    let content = JSON.parse(rawdata);

    const todo = {
        id: id++,
        title,
        body,
        completed: completed || false,
    };

    AddDataToJson("db.json", todo);
    RenderMain(res, "db.json", 'todo.ejs')
    });

app.route("/remove/:id").get((req, res) => {
    console.log('/remove/:id')
    const id = req.params.id;
    let rawdata = fs.readFileSync("db.json", "utf8");
    let content = JSON.parse(rawdata);
    if (!content.find((i) => i.id == id)) {
        return res.status(404).json({message: "Todo with that id not found"});
    } else {
        const toWrite = content.filter((i) => i.id != id);

        fs.writeFileSync("db.json", JSON.stringify(toWrite), (err) => {
            if (err) {
                console.error(err);
            }
        });
        //res.status(202).json({message: "Successfully deleted"});
        res.redirect("/");
    }     
    });
  
app.route("/edit/:id").get((req, res) => { 
    const id = req.params.id;
    let todo_array = getDataFromJSON("db.json")  
    res.render("todoEdit.ejs", { todo_array: todo_array, idTask: id });
})
.post((req, res) => {
    console.log("post")
    const id = req.params.id;

    let todo_array = getDataFromJSON("db.json")
    if (!todo_array.find((i) => i.id == id)) {
        return res.status(404).json({message: "Todo with that id not found"});
    } else {
        console.log("else")
        const newTodo = req.body;
        console.log("req.body", req.body)
        const toWrite = todo_array.map((i) => {
            console.log("i.id=", typeof(i.id))
            console.log("id=",typeof(id))
            if (i.id === Number(id)) {
                newTodo.id=Number(id)
                console.log("newTodo=", newTodo)
                return newTodo;
            }
            console.log("return i")
            return i;
        });
        console.log("JSON.stringify(toWrite)",toWrite)
        fs.writeFileSync("db.json", JSON.stringify(toWrite), (err) => {
            if (err) {
                console.error(err);
            }
        });

        res.redirect("/");
    }   
});

app.listen(8080, function () {
    console.log("Listening on port 8080");
});
