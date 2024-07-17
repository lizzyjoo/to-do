import { v4 as uuidv4 } from 'uuid'

class Task {
    constructor (content, priority, due, parentProject, id=uuidv4()) {
        this.content = content;
        this.priority = priority;
        this.due = due;
        this.parentProject = parentProject;
        this.completed = false;
        this.id = id;
    }
    toggleCompleted() {
        this.completed = !this.completed
    }

    static convertJSON(json){
        const task = new Task(json.content, json.priority, json.due, json.parentProject, json.id);
        task.completed = json.completed;
        return task;
    }
}

export default Task;