const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = __dirname + '/todo.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

const client = new todoProto.TodoService('localhost:50051', grpc.credentials.createInsecure());

function listTodos() {
    const call = client.getTodoList({});
    call.on('data', (todoList) => {
        console.log(todoList);
    });
}

function getTodoById(todoId) {
    const call = client.getTodoById({id: todoId});
    call.on('data', (todo) => {
        console.log(todo);
    });
}

function addTodo() {
    const todo = {
        title: 'New Todo',
        description: 'This is a new todo',
        is_completed: false
    };

    client.addTodo(todo, (err, insertedTodo) => {
        console.log(insertedTodo);
    });
}

function updateTodo() {
    const todo = {
        id: 1,
        title: 'Updated Todo',
        description: 'This is an updated todo',
        is_completed: true
    };

    client.updateTodo(todo, (err, updatedTodo) => {
        console.log(updatedTodo);
    });
}

function deleteTodoById(todoId) {
    const call = client.deleteTodoById({id: todoId});
    call.on('data', (deletedTodo) => {
        console.log(deletedTodo);
    });
}

listTodos();
getTodoById(1);
addTodo();
updateTodo();
deleteTodoById(1);