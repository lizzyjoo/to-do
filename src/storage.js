import Project from "./project";

class Storage {
    // function to save projects to local storage
    static saveProjects(projects) {
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    static loadProjects() {
        // parse JSON array, if the JSON returns null, projects = empty array
        const projects = JSON.parse(localStorage.getItem('projects')) || []; 
        // converts plain object back into instance of project class
        return projects.map((project) => Project.convertJSON(project));
    }
    static getProjects() {
        return this.loadProjects();
    }
    // get specific project based on ID
    static getProject(projectId) {
        const projects = this.loadProjects();
        return projects.find((proj) => proj.id === projectId);
    }

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

    static updateProject(updatedProject) {
        const projects = this.loadProjects();
        const projectIndex = projects.findIndex((proj) => proj.id === updatedProject.id);
        if (projectIndex !== -1) {
            projects[projectIndex] = updatedProject;
            this.saveProjects(projects);
        }
    }

    static deleteProject(projectID){
        let projects = this.loadProjects();
        projects = projects.filter((proj) => proj.id !== projectID);
        this.saveProjects(projects);
    }

    static editProject(projectID, newTitle, newDescription){
        let projects = this.loadProjects();
        const project = projects.find((proj) => proj.id === projectID);
        
        if (project){
           project.title = newTitle;
           project.description = newDescription;
           this.updateProject(project);
        }
    }

    static sortTaskByDueDate(task, projectID) {
        const projects = this.loadProjects();
        // identify project
        const project = projects.find((proj) => proj.id === projectID);
        project.addTask(task);
        this.updateProject(project);
    }

}

export default Storage; 