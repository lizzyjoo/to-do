import "./style.css"; 
import { subYears, addDays, addMonths, addYears, format } from 'date-fns'

import UI from "./ui";
import Task from "./task";
import Project from "./project";
import Storage from "./storage";

const createDefaultTasks = () => {
    const today = new Date();
    const tasks = [
        {
        content: 'Water the plants',
        priority: 'high',
        dueDate: format(subYears(today, new Date().getFullYear()), 'yyyy-MM-dd'), // Current year years ago
        parentProjectId: '1'
        },
        {
        content: 'Go to trader joes for groceries',
        priority: 'medium',
        dueDate: format(addDays(today, -1), 'yyyy-MM-dd'), // Yesterday
        parentProjectId: '1'
        },
        {
        name: 'Do laundry',
        priority: 'low',
        dueDate: format(today, 'yyyy-MM-dd'), // Today
        parentProjectId: '1'
        },

    ]

    return tasks

}

document.addEventListener('DOMContentLoaded', () => {
    // Add default projects and tasks
  
    
  
    // Default tasks
    const defaultTasks = createDefaultTasks()
  
    
  
    UI.initialize()
  });