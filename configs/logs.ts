import { writeFile, readFile, appendFile,mkdir } from 'fs/promises';
import { existsSync } from 'fs';


interface Logs {
    name: string;
    message: string;
    clientMessage: string;
    stack: string;
    error: string;
    date: string;

}
const LOGS_PATH = process.env.LOGS_PATH as string;

export async function logsWrite(logInfo: Logs) {
    //check for the existence of the logs path and file
    let logEntry = JSON.stringify(logInfo);
    let separator = '----------------------------------'

    if(existsSync(LOGS_PATH)) {
        //create a new log file
        await mkdir(LOGS_PATH);
        await writeFile(LOGS_PATH, '', { encoding: 'utf-8' });

    }
    
    await appendFile(LOGS_PATH, `${separator}\n`, { encoding: 'utf-8' });

    await appendFile(LOGS_PATH, `${logEntry}\n`, { encoding: 'utf-8' });
    
    

}