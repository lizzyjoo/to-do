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
    static getProject (projectId) {
        const projects = this.loadProjects()
        return projects.find((proj) => proj.id === projectId)
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

    // add a task
    // notes: sorting a task item
    // everything essentially belongs in inbox. value =1
    // but depending on the due date, it can belong to today, upcoming, anytime, overdue
    // completed: only contains items in which its completed bool value is true
    // each custom made project has UUID. each project will contain both completed and non completed items
    
    static addTasktoProject(task, projectID){
        const projects = this.loadProjects();
        // identify project
        const project = projects.find((proj) => proj.id === projectID);
        if (project) {
            project.addTask(task)
            this.updateProject(project)
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

    static editProject(projectID){
        let projects = this.loadProjects();
        const project = projects.find((proj) => proj.id === projectID);
        if (project){
           
        }
    }
}

export default Storage; 