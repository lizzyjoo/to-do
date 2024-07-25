import Task from "./task";
import { v4 as uuidv4 } from 'uuid';
// project item has: title, description, array of tasks, and unique ID (UUID)
class Project{
    constructor (title, description, id = uuidv4()) {
        this.title = title;
        this.description = description;
        this.tasks = [];
        this.id = id;
    }
    
    addTask(task) {
        this.tasks.push(task);
    }

    removeTask(task) {
        const taskId = task.id;
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);

        if (taskIndex !== -1) {
            this.tasks.splice(taskIndex, 1);
        }
    }
    
    editTitle(newTitle) {
        this.title = newTitle;
    }

    editDescription(newDescription) {
        this.description = newDescription;
    }

    static convertJSON(json){
        const project = new Project(json.title, json.description, json.id);
        project.tasks = json.tasks.map((taskData) => Task.convertJSON(taskData));
        return project;
    }



}

export default Project;