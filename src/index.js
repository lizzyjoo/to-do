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

    return tasks;

}

const createDefaultProjects = () => {
    const projects = [
        {
            title: 'Inbox',
            description: '',
            tasks: [],
            id: '1'
        },
        {
            title: 'Today',
            description: '',
            tasks: [],
            id: '2'
        },
        {
            title: 'Upcoming',
            description: '',
            tasks: [],
            id: '3'
        },
        {
            title: 'Anytime',
            description: '',
            tasks: [],
            id: '4'
        },
        {
            title: 'Completed',
            description: '',
            tasks: [],
            id: '5'
        },
        {
            title: 'Overdue',
            description: '',
            tasks: [],
            id: '6'
        }
    ]
    return projects;
}

document.addEventListener('DOMContentLoaded', () => {
    
    // Default Projects
    const defaultProjects = createDefaultProjects();
    defaultProjects.forEach((project) => Storage.addProject(project));
    UI.initialize()
    // Default tasks
    const defaultTasks = createDefaultTasks();

  });