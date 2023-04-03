const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mysql = require('mysql2');

const PROTO_PATH = __dirname + '/todo.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

const server = new grpc.Server();
const dbConnection = mysql.createConnection({
    host: 'localhost',
    user: 'nas',
    password: 'nas27',
    database: 'todo_db'
});

server.addService(todoProto.TodoService.service, {
    getTodoList: getTodoList,
    getTodoById: getTodoById,
    addTodo: addTodo,
    updateTodo: updateTodo,
    deleteTodoById: deleteTodoById
});

function getTodoList(call, callback) {
    dbConnection.query('SELECT * FROM todos', (err, rows) => {
        if (err) {
            console.log(err);
            return;
        }

        const todoList = {
            items: rows.map((row) => {
                return {
                    id: row.id,
                    title: row.title,
                    description: row.description,
                    is_completed: row.is_completed === 1
                };
            })
        };

        callback(null, todoList);
    });
}

function getTodoById(call, callback) {
    const todoId = call.request.id;

    dbConnection.query('SELECT * FROM todos WHERE id = ?', [todoId], (err, rows) => {
        if (err) {
            console.log(err);
            return;
        }

        const todo = {
            id: rows[0].id,
            title: rows[0].title,
            description: rows[0].description,
            is_completed: rows[0].is_completed === 1
        };

        callback(null, todo);
    });
}

function addTodo(call, callback) {
    const todo = call.request;

    dbConnection.query('INSERT INTO todos SET ?', {
        title: todo.title,
        description: todo.description,
        is_completed: todo.is_completed ? 1 : 0
    }, (err, result) => {
        if (err) {
            console.log(err);
            return;
        }

        const insertedTodo = {
            id: result.insertId,
            title: todo.title,
            description: todo.description,
            is_completed: todo.is_completed
        };

        callback(null, insertedTodo);
    });
}

function updateTodo(call, callback) {
    const todo = call.request;

    dbConnection.query('UPDATE todos SET title = ?, description = ?, is_completed = ? WHERE id = ?', [
        todo.title,
        todo.description,
        todo.is_completed ? 1 : 0,
        todo.id
    ], (err, result) => {
        if (err) {
            console.log(err);
            return;
        }

        callback(null, todo);
    });
}

function deleteTodoById(call, callback) {
    const todoId = call.request.id;

    dbConnection.query('DELETE FROM todos WHERE id = ?', [todoId], (err, result) => {
        if (err) {
            console.log(err);
            return;
        }

        const deletedTodo = {
            id: todoId,
            title: '',
            description: '',
            is_completed: false
        };

        callback(null, deletedTodo);
    });
}

server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
    console.log(err);
    return;
    }
    console.log('Server running at http://127.0.0.1:50051');
    server.start();
    });