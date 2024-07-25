import Project from "./project";

class Storage {
    // function to save projects to local storage
    static saveProjects(projects) {
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    // load saved projects
    static loadProjects() {
        // parse JSON array, if the JSON returns null, projects = empty array
        const projects = JSON.parse(localStorage.getItem('projects')) || []; 
        // converts plain object back into instance of project class
        return projects.map((project) => Project.convertJSON(project));
    }

    // get all projects
    static getProjects() {
        return this.loadProjects();
    }

    // get specific project based on ID
    static getProject(projectId) {
        const projects = this.loadProjects();
        return projects.find((proj) => proj.id === projectId);
    }

    //get all tasks
    static getTasks() {
        const projects = this.loadProjects();
        let tasks = [];

        projects.forEach(project => {
            tasks = tasks.concat(project.tasks);
        });
        return tasks;
    }

    // get task by specific id
    static getTaskById(taskId) {
        const projects = this.loadProjects();
        for (const project of projects) {
            const task = project.tasks.find(task => task.id === taskId);
            if (task) {
                return task;
            }
        }
        return null; // Task not found
    }


    //add a project to JSON projects
    static addProject(project){
        const projects = this.loadProjects();
        // ensure there is no duplicate 
        if (!projects.some((proj) => proj.id === project.id)) {
            projects.push(project);
            this.saveProjects(projects);
          }
    }

    // initially adding task 
    static addTasktoProject(task, projectID){
        const projects = this.loadProjects();
        const project = projects.find((proj) => proj.id === projectID);
        const inbox = projects.find((proj) => proj.id === '1');

        if (project) {
            if (project.id === '1') {
                project.addTask(task);
                this.updateProject(project);
            } else {
                project.addTask(task);
                this.updateProject(project);
                inbox.addTask(task);
                this.updateProject(inbox);
            }
        }
    }

    // add task to a custom made project
     static addTasktoCustomProject(task, projectID) {
        const projects = this.loadProjects();
        const project = projects.find((proj) => proj.id === projectID);
        if (project) {
            project.addTask(task);
            this.updateProject(project);
        }
     }

     static updateTask(updatedTask) {
        const projects = this.loadProjects();

        // Remove the task from all projects
        projects.forEach(project => {
            const taskIndex = project.tasks.findIndex(task => task.id === updatedTask.id);
            if (taskIndex !== -1) {
                project.tasks.splice(taskIndex, 1);
            }
        });

        // Add the task to the "Completed" project if completed
        if (updatedTask.completed) {
            const completedProject = projects.find(project => project.id === '5');
            if (completedProject) {
                completedProject.tasks.push(updatedTask);
            }
        } else {
            // Otherwise, add it back to its original project
            const originalProject = projects.find(project => project.id === updatedTask.parentProject);
            if (originalProject) {
                originalProject.tasks.push(updatedTask);
            }
        }

        localStorage.setItem('projects', JSON.stringify(projects));
    }

    // update project
    static updateProject(updatedProject) {
        const projects = this.loadProjects();
        const projectIndex = projects.findIndex((proj) => proj.id === updatedProject.id);
        if (projectIndex !== -1) {
            projects[projectIndex] = updatedProject;
            this.saveProjects(projects);
        }
    }

    // delee project
    static deleteProject(projectID){
        let projects = this.loadProjects();
        projects = projects.filter((proj) => proj.id !== projectID);
        this.saveProjects(projects);
    }

    // edit project
    static editProject(projectID, newTitle, newDescription){
        let projects = this.loadProjects();
        const project = projects.find((proj) => proj.id === projectID);
        
        if (project){
           project.title = newTitle;
           project.description = newDescription;
           this.updateProject(project);
        }
    }

    // assign task a due status 
    static sortTaskByDueDate(task, projectID) {
        const projects = this.loadProjects();
        // identify project
        const project = projects.find((proj) => proj.id === projectID);
        if (project) {
            project.addTask(task);
            this.updateProject(project);
        } 
    }

}

export default Storage; 