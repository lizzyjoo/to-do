import "./style.css"; 
import UI from "./ui";
import Task from "./task";
import Project from "./project";
import Storage from "./storage";


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
    defaultProjects.forEach((project) => {
        
        Storage.addProject(project)
    });

    UI.initialize()
    
  
  });