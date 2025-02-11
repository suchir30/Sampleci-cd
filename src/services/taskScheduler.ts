// src/services/taskScheduler.ts
import cron from 'node-cron';
// src/services/taskScheduler.ts
import { doorBookingCharge } from './invoiceAWB';  // Correct import based on the file structure


// Define a type for the task function and schedule
type ScheduledTask = {
    name: string;
    schedule: string; // Cron expression
    taskFunction: () => Promise<void>; // Function to execute
};

// A list to store all scheduled tasks
const scheduledTasks: ScheduledTask[] = [];

// Function to add a new task to the scheduler
export const addTask = (name: string, schedule: string, taskFunction: () => Promise<void>) => {
    // Check if task with the same name already exists
    if (scheduledTasks.some(task => task.name === name)) {
        console.log(`Task with name ${name} already exists.`);
        return;
    }

    // Add the new task
    const newTask: ScheduledTask = { name, schedule, taskFunction };
    scheduledTasks.push(newTask);
    scheduleTask(newTask);
};

// Function to schedule a task
const scheduleTask = (task: ScheduledTask) => {
    cron.schedule(task.schedule, async () => {
        console.log(`Running task: ${task.name}`);
        try {
            await task.taskFunction();
            console.log(`Task ${task.name} completed successfully.`);
        } catch (error) {
            console.error(`Error running task ${task.name}:`, error);
        }
    });
};

// Function to start all scheduled tasks
export const startAllTasks = () => {
    scheduledTasks.forEach(task => {
        console.log(`Task ${task.name} is scheduled.`);
    });
};

// addTask('doorBookingCharge', '*/5 * * * * *', async () => {
//      // Replace with dynamic data if necessary
//     // await pricing(AWBId);
//     console.log("calling addTask")
//     await doorBookingCharge();
// });




