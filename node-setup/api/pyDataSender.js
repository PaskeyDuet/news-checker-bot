const { spawn } = require('child_process');

const dataToSend = JSON.stringify({ "name": 'Alice', "age": 30, "city": 'New York' });

const python = spawn('python', ['./script.py', dataToSend]);

python.stdout.on('data', (data) => {
     console.log(`Result from Python script: ${data}`);
});

python.stderr.on('data', (data) => {
     console.error(`Error from Python script: ${data}`);
});

python.on('close', (code) => {
     console.log(`Python script finished with code ${code}`);
});