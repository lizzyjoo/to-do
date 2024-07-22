import { v4 as uuidv4 } from 'uuid'

class Task {
    constructor (content, priority, due, anytime, parentProject, id) {
        this.content = content;
        this.priority = priority;
        this.due = due;
        this.anytime = anytime;
        this.parentProject = parentProject; // id
        this.completed = false;
        this.id = id;
    }
    toggleCompleted() {
        this.completed = !this.completed
    }

    static convertJSON(json){
      
        const task = new Task(json.content, json.priority, json.due, json.anytime, json.parentProject, json.id);
        task.completed = json.completed;
        return task;
    }
}

export default Task;