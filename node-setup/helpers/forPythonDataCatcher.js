import { spawn } from 'child_process';

export async function objToTranslator(obj) {
     const stringObj = JSON.stringify(obj)

     const python = spawn('python', ['helpers/translator.py', stringObj]);
     python.stdout.on('data', (data) => {
          console.log(`Result from Python script: ${data}`);
     });

     python.stderr.on('data', (data) => {
          console.error(`Error from Python script: ${data}`);
     });

     python.on('close', (code) => {
          console.log(`Python script finished with code ${code}`);
     });
}

