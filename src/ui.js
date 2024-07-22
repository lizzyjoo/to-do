import Task from "./task";
import Project from "./project";
import Storage from "./storage";
import { v4 as uuidv4 } from 'uuid';

import {
    isToday,
    parseISO,
    startOfDay,
    isBefore,
    isFuture
  } from 'date-fns'

// Define project IDs for special cases
const TASK_IDS = {
    INBOX: '1',
    TODAY: '2',
    UPCOMING: '3',
    ANYTIME: '4',
    COMPLETED: '5',
    OVERDUE: '6'
  }

  

class UI{
    static initialize() {
        //localStorage.clear();
        this.domElements();
        this.addEventListeners();
        this.loadStorageProjects();
        this.populateTaskForm();
        this.loadProjectPage(TASK_IDS.INBOX);
    }

    static domElements() {
        this.logo = document.querySelector(".logo");
        this.addTaskBtn = document.getElementById("addTaskBtn");
        this.taskModal = document.getElementById("task-modal");
        this.taskForm = document.querySelector(".task-form");
        this.taskModalClose = document.getElementById("close-task");
        this.errorMessageDiv = document.getElementById("form-error-message");

        this.taskSection = document.querySelector(".task-section");
        this.dueDateInput = document.querySelector("#task-due");
        this.anytimeCheck = document.querySelector("#anytime");
        this.sidebar = document.querySelector(".sidebar");

        this.addProjectBtn = document.getElementById("addProjectBtn");
        this.projectModal = document.getElementById("project-modal");
        this.projectForm = document.querySelector(".project-form");
        this.projectModalClose = document.getElementById("close-project");
        this.projectList = document.querySelector(".project-list");
        this.closeModalBtns = document.querySelectorAll('.close-modal');
        this.checkboxes = document.querySelectorAll(".task-item input[type='checkbox']");
        // default project divs
        this.defaultProjects = [
            document.getElementById("inbox-div"),
            document.getElementById("today-div"),
            document.getElementById("upcoming-div"),
            document.getElementById("anytime-div"),
            document.getElementById("completed-div"),
            document.getElementById("overdue-div")
        ];
    }

    static addEventListeners() {
        this.addTaskBtn.addEventListener("click", () => this.displayTaskModal());
        this.taskModalClose.addEventListener("click", () => this.closeTaskModal());
        this.taskForm.addEventListener("submit", (event) => this.handleTaskFormSubmit(event));
        this.anytimeCheck.addEventListener("change", () => this.handleAnytimeCheckbox());
        this.dueDateInput.addEventListener("input", ()=>this.handleDueInput());
        this.addProjectBtn.addEventListener("click", () => this.displayProjectModal());
        this.projectModalClose.addEventListener("click", () => this.closeProjectModal());
        this.projectForm.addEventListener("submit", (event)=>this.handleProjectFormSubmit(event));
        this.logo.addEventListener("click", ()=> this.loadProjectPage("1"));
        
        this.checkboxes.forEach((checkbox) => {
            checkbox.addEventListener('change', (event) => this.handleCheckboxChange(event));
        })
        this.defaultProjects.forEach(project => {
            project.addEventListener("click", (event) => this.handleDefaultProjectClick(event));
        });
        
        this.closeModalBtns.forEach((closeModalBtn) => {
            closeModalBtn.addEventListener('click', () =>
              this.resetForm(closeModalBtn)
            )
          });
 
    }

    static handleDefaultProjectClick(event) {
        const value = event.currentTarget.dataset.value;
        this.loadProjectPage(value);
    }

    static handleCheckboxChange(event) {
        const checkbox = event.target;
        const taskId = checkbox.getAttribute('data-value'); // Get task ID from the checkbox's data-value attribute

        if (taskId) {
            // Get the task
            const task = Storage.getTaskById(taskId);
            if (task) {
                task.completed = checkbox.checked; // Update the completed status based on the checkbox
                
                // Get all projects
                const projects = Storage.getProjects();
                // Update the task status in all relevant projects
                projects.forEach((project) => {
                    const taskInProject = project.tasks.find(t => t.id === taskId);
                    if (taskInProject) {
                        taskInProject.completed = task.completed;
                        Storage.updateProject(project);
                    }
                });

                // Handle adding/removing task from "Completed" project
                const completedProject = projects.find(project => project.id === TASK_IDS.COMPLETED);
                if (completedProject) {
                    const taskInCompletedProject = completedProject.tasks.find(t => t.id === taskId);
                    if (task.completed && !taskInCompletedProject) {
                        // Add task to "Completed" project if not already there
                        completedProject.tasks.push(task);
                    } else if (!task.completed && taskInCompletedProject) {
                        // Remove task from "Completed" project if it is there
                        completedProject.tasks = completedProject.tasks.filter(t => t.id !== taskId);
                    }
                    Storage.updateProject(completedProject);
                }
                // Reload tasks for the current project page
                const currentProjectId = this.taskSection.querySelector('.page-header .project-header-title').getAttribute('data-project-id');
                this.loadProjectPage(currentProjectId);

                // // Reload tasks for all affected projects
                // this.loadAllProjects();
                // this.loadProjectPage(task.parentProject);

            }
    }
}

static loadAllProjects() {
        // Reload tasks for all default projects
        this.defaultProjects.forEach(project => {
            const projectId = project.dataset.value;
            this.loadTasks(projectId);
        });
    }

    // static handleCompletedTask(taskID){
    //     // first, update the task status as well as the project that contains the task 
    //     const projects = Storage.loadProjects();
    //     for (const project of projects) {
    //         const task = project.tasks.find(task => task.id === taskID);
    //         if (task) {
    //             task.completed = true; // Update the completed status
    //             Storage.updateProject(project); // Save the updated project back to local storage
    //             break;
    //         }
    //     }
    // }
    static handleAnytimeCheckbox() {
        if (this.anytimeCheck.checked) {
            this.dueDateInput.disabled = true;  // Disable the date input
            this.dueDateInput.value = '';       // Clear the date input
        } else {
            this.dueDateInput.disabled = false; // Enable the date input
        }
    }
    
    static handleDueInput() {
        if (this.dueDateInput.value) {
            this.anytimeCheck.disabled = true;  // Disable the 'anytime' checkbox if date is selected
        } else {
            this.anytimeCheck.disabled = false; // Enable the 'anytime' checkbox if date is cleared
        }
    }

    static displayProjectModal() {
        this.projectModal.style.display = "block";
    }

    static displayTaskModal() {
        this.taskModal.style.display = "block";
    }


    static closeProjectModal() { 
        this.projectModal.style.display = "none";
    }

    static closeTaskModal() {
        this.taskModal.style.display = "none";
    }

    
    static createTask(form, id = uuidv4()){
        const parentProjectId = form.querySelector("#parent-project").value;
        
        return new Task(
            form.querySelector("#task-content").value,
            form.querySelector("#priority").value,
            form.querySelector("#task-due").value,
            form.querySelector('#anytime').checked,
            parentProjectId,
            id
        );
    }

    static createProject(form, id = uuidv4()){
        return new Project(
            form.querySelector("#project-title-input").value,
            form.querySelector("#project-description-input").value,
            id
        )
    }

    // create new project if project form inputs are valid
    static handleProjectFormSubmit(event) {
        event.preventDefault();
        if (this.projectForm.checkValidity()) {
            // create new project object
            const newProject = this.createProject(this.projectForm);
            // store new project to local storage
            Storage.addProject(newProject);
            this.resetForm(
                this.projectForm.closest('.project-modal').querySelector('.close-modal')
            );
            this.closeProjectModal();
            this.loadStorageProjects();
            this.addProjectToTaskForm(newProject);

        } 
        
    }

    // handle task form submission 
    static handleTaskFormSubmit(event) {
        event.preventDefault();
        if (!this.dueDateInput.value && !this.anytimeCheck.checked) {
            this.errorMessageDiv.textContent = "Please provide either a due date or check 'Anytime'.";
            this.errorMessageDiv.style.display = "block";
            return;
        } else {
            this.errorMessageDiv.style.display = "none";
        }
        if (this.taskForm.checkValidity()) {
            const newTask = this.createTask(this.taskForm);
            const taskParent = newTask.parentProject;
            // first, add to either just Inbox or inbox+specific project
            Storage.addTasktoProject(newTask, taskParent);
            // determine due status and sort in appropriate project
            const dueDateProject = this.sortTaskDueDate(newTask);
            Storage.sortTaskByDueDate(newTask,dueDateProject);

            this.resetForm(this.taskForm.closest('.task-modal').querySelector('.close-modal'));
            this.closeTaskModal();
            this.loadTasks(newTask.parentProject);
            this.loadProjectPage(taskParent);

            this.anytimeCheck.checked = false;
            this.dueDateInput.disabled = false;
            this.dueDateInput.value = '';
        }

    }

    static sortTaskDueDate(task) {
        const dueDate = parseISO(task.due);
        const anytime = task.anytime;
        const today = startOfDay(new Date());
        
        const startOfDueDate = startOfDay(dueDate);

        // Check if the task is due today, in the past, or in the future
        const pastDue = isBefore(startOfDueDate, today);   
        const dueToday = isToday(startOfDueDate);
        const upcoming = isFuture(startOfDueDate) && !dueToday;

        if (pastDue) {
            return "6"
        } else if (dueToday) {
            return "2";     
        } else if (upcoming) {
            return "3";
        } else if (anytime) {
            return "4";
        }
    }
    
    static loadTasks(projectID) {
        this.taskSection.innerHTML = "";
        // add the task to the appropriate project 
        const project = Storage.getProject(projectID);
        const incompleteTasks = [];
        const completedTasks = [];
        project.tasks.forEach((task) => {
            if (task.completed) {
              completedTasks.push(task)
            } else {
              incompleteTasks.push(task)
            }
          })
        // Append incomplete tasks first, then completed tasks
        incompleteTasks.forEach((task) => {
            this.taskSection.appendChild(this.createTaskDiv(task, projectID));
        });
        completedTasks.forEach((task) => {
            this.taskSection.appendChild(this.createTaskDiv(task, projectID));
        });

      
    }
    static loadStorageProjects () {
        this.projectList.innerHTML = '';
        const projects = Storage.getProjects();
        projects.forEach((project) => {
            if (!Object.values(TASK_IDS).includes(project.id)) {
                this.createProjectDiv(project);
            }
        });

        // Update defaultProjects list
        this.defaultProjects = [
            document.getElementById("inbox-div"),
            document.getElementById("today-div"),
            document.getElementById("upcoming-div"),
            document.getElementById("anytime-div"),
            document.getElementById("completed-div"),
            document.getElementById("overdue-div")
        ];
    }

    static addProjectToTaskForm(project){
        const taskFormProjectOption = document.createElement("option");
        taskFormProjectOption.value = project.id;
        taskFormProjectOption.textContent = project.title;

        const taskFormParentProject = this.taskForm.querySelector("#parent-project");
        taskFormParentProject.appendChild(taskFormProjectOption);
    }

    static populateTaskForm() {
        const projects = Storage.loadProjects();
        
        projects.forEach(project => {
            if (!['2', '3', '4', '5', '6'].includes(project.id)) {
                this.addProjectToTaskForm(project);
            }
            
        });
    }
    
    static createTaskDiv(task, currentProjectID){
        const taskItem = document.createElement("div");
        taskItem.classList.add("task-item");
        

        const taskCheckBox = document.createElement("input");
        taskCheckBox.classList.add("checkbox");
        taskCheckBox.type = "checkbox";
        taskCheckBox.checked = task.completed;
        taskCheckBox.setAttribute("data-value", task.id);
        taskCheckBox.addEventListener('change', (event) => this.handleCheckboxChange(event));
        
        // task details
        const taskDetailDiv = document.createElement("div");
        taskDetailDiv.classList.add("task-detail");

        taskDetailDiv.appendChild(taskCheckBox);

        // task name
        const taskContent = document.createElement("div");
        taskContent.classList.add("task-content")
        taskContent.textContent = task.content;
        taskDetailDiv.appendChild(taskContent);

        // div for task labels
        const taskLabels = document.createElement("div");
        taskLabels.classList.add("task-labels");

        const taskDueDiv = document.createElement("div");
        taskDueDiv.classList.add("task-due-div");
        taskDueDiv.textContent = task.due;

        const taskPriorityDiv = document.createElement("div");
        taskPriorityDiv.classList.add("task-priority-div");
        taskPriorityDiv.textContent = task.priority;

        if (task.priority == "Low"){
            taskPriorityDiv.classList.add("low");
        } else if (task.priority == "Medium"){
            taskPriorityDiv.classList.add("medium");
        } else if (task.priority == "High"){
            taskPriorityDiv.classList.add("high");
        }

        const taskProjectDiv = document.createElement("div");
        taskProjectDiv.classList.add("task-project-div");

        // Retrieve project title
        const project = Storage.getProject(task.parentProject);
        if (!task.anytime) {
            taskLabels.appendChild(taskDueDiv);
        }
        
        taskLabels.appendChild(taskPriorityDiv);
        // Display parent project label only if not on the specific project page
        if (task.parentProject !== currentProjectID && !['1','2', '3', '4', '5', '6'].includes(project.id)) {
            taskProjectDiv.textContent = project.title;
            taskLabels.appendChild(taskProjectDiv);
        }
        
        
        taskItem.appendChild(taskDetailDiv);
        taskItem.appendChild(taskLabels);
        
        return taskItem;
    }

    static createProjectDiv(project){
        const projectItem = document.createElement("div");
        projectItem.classList.add("project-item");

        const hashtag = document.createElement("p");
        hashtag.classList.add("project-hashtag");
        hashtag.textContent = "#";
        

        const projectTitleP = document.createElement("p");
        projectTitleP.classList.add("project-title-p");
        projectTitleP.textContent = project.title;
        
        
        const projectItemDiv = document.createElement("div");
        projectItemDiv.classList.add("project-item-div");
        projectItemDiv.appendChild(hashtag);
        projectItemDiv.appendChild(projectTitleP);
        projectItem.appendChild(projectItemDiv);

        // div for project menu drop down button
        const projectDropDown = document.createElement("div");
        projectDropDown.classList.add("project-dropdown");
        // button
        const optionBtn = document.createElement("button");
        optionBtn.classList.add("project-option");
        projectDropDown.appendChild(optionBtn);

        // drop down content
        const dropDownContent = document.createElement("div");
        dropDownContent.classList.add("project-dropdown-content");
        dropDownContent.id = "dropdown-content";
        const editOption = document.createElement("p");
        editOption.textContent = "Edit";
        editOption.classList.add("edit-option");
        const deleteOption = document.createElement("p");
        deleteOption.textContent = "Delete";
        deleteOption.classList.add("delete-option");
        dropDownContent.appendChild(editOption);
        dropDownContent.appendChild(deleteOption);

        projectDropDown.appendChild(dropDownContent);
        projectItem.appendChild(projectDropDown);
        // 1. event listener for the project name div: once clicked, page will load project details
        projectItemDiv.addEventListener("click", () => this.loadProjectPage(project.id));
        // 2. event listener for project option button
        optionBtn.addEventListener("click", () => {
            dropDownContent.classList.toggle("show");
            optionBtn.classList.toggle("clicked");
            
        });
        // event listeners to handle project edit and delete option
        editOption.addEventListener("click", ()=>this.handleEditOption(project.id, projectItemDiv));
        deleteOption.addEventListener("click", ()=> this.handleDeleteOption(project,projectItemDiv));
    
        // if user clicks anywhere else on the window, close
        window.onclick = function(event) {
            
            if (!event.target.matches(".project-option")) {
                // a more efficient way to do this??
                let btns = document.getElementsByClassName("project-option");
                let k;
                for (k = 0; k < btns.length; k++) {
                    let btn = btns[k];
                    if (btn.classList.contains('clicked')) {
                    btn.classList.remove('clicked');
                    }
                }
                let dropdowns = document.getElementsByClassName("project-dropdown-content");
                let i;
                for (i = 0; i < dropdowns.length; i++) {
                    let openDropdown = dropdowns[i];
                    if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                    }
                }
   
            }
        }
        this.projectList.appendChild(projectItem);

    }
    
    static resetForm(closeModalBtn) {
        const modal = closeModalBtn.closest('.project-modal') || closeModalBtn.closest('.task-modal') || closeModalBtn.closest('.project-edit-modal');
        if (modal) {
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
            }
        }
    }

    static handleEditOption(projectID, projectItemDiv) {
        const projects = Storage.loadProjects();
        // identify project
        const project = projects.find((proj) => proj.id === projectID);
        const projectEditModal = document.createElement("div");
        projectEditModal.classList.add("project-edit-modal");
        projectEditModal.style.display = "block";
        const projectEditModalContent = document.createElement("div");
        projectEditModalContent.classList.add("project-modal-content");

        projectEditModal.appendChild(projectEditModalContent);

        const modalHeader = document.createElement("div");
        modalHeader.classList.add("modal-header");
        const modalHeaderH2 = document.createElement("h2");
        modalHeaderH2.textContent = "Edit Project";
        modalHeader.appendChild(modalHeaderH2);
        

        const modalCloseSpan = document.createElement("span");
        modalCloseSpan.classList.add("close-modal");
        modalCloseSpan.textContent = "\u00D7";
        modalHeader.appendChild(modalCloseSpan);

        projectEditModalContent.appendChild(modalHeader);
        // project edit form
        const projectEditForm = document.createElement("form");
        projectEditForm.classList.add("project-form");

        const projectTitleEdit = document.createElement("input");
        projectTitleEdit.type = "text";
        projectTitleEdit.classList.add("project-form-input");
        projectTitleEdit.id = "project-title-edit";
        projectTitleEdit.value = project.title;
        projectEditForm.appendChild(projectTitleEdit);

        const projectDescriptionEdit = document.createElement("input");
        projectDescriptionEdit.type = "text";
        projectDescriptionEdit.classList.add("project-form-input");
        projectDescriptionEdit.id = "project-description-edit";
        projectDescriptionEdit.value = project.description;
        projectEditForm.appendChild(projectDescriptionEdit);

        const projectEditSubmit = document.createElement("input");
        projectEditSubmit.type = "submit";
        projectEditSubmit.classList.add("project-submit");
        projectEditSubmit.value = "Edit Project";
        projectEditForm.appendChild(projectEditSubmit);

        projectEditModalContent.appendChild(projectEditForm);
        projectEditModal.appendChild(projectEditModalContent);
        this.sidebar.appendChild(projectEditModal);

        modalCloseSpan.addEventListener('click', () =>{
            this.resetForm(modalCloseSpan);
            projectEditModal.style.display = "none";
        });
        // add event listner to form for form submit; update project
        projectEditForm.addEventListener("submit", (event) => {this.handleEditFormSubmit(event,projectEditForm,projectItemDiv, project)});


    }

    // handle project edit form 
    static handleEditFormSubmit(event, projectEditForm, projectItemDiv, project){
        event.preventDefault();
        
        if (projectEditForm.checkValidity()){
            
            // edit UI: sidebar element
            const originalTitle = projectItemDiv.querySelector(".project-title-p");
            const newTitle = projectEditForm.querySelector("#project-title-edit").value;
            const newDescription = projectEditForm.querySelector("#project-description-edit").value;
            
            originalTitle.textContent = newTitle;
            
            // also update project info in storage
            Storage.editProject(project.id, newTitle, newDescription);
            this.loadProjectPage(project.id);
            this.updateTaskFormParentProject(project)
            this.resetForm(
                projectEditForm.closest('.project-edit-modal').querySelector('.close-modal')
            );
            projectEditForm.closest('.project-edit-modal').style.display = "none";
        }
    }

    // update project name in the add task form parent project dropdown
    static updateTaskFormParentProject(project) {
        const projects = Storage.loadProjects();
        const projectID = project.id;
        // identify project
        const updatedProject = projects.find((proj) => proj.id === projectID);
    
        
        const formParentSelectElem = this.taskForm.querySelector("#parent-project");
        const originalParentOption = formParentSelectElem.querySelector(`option[value="${projectID}"]`);
        
        originalParentOption.textContent = updatedProject.title;
    }

    // delete project from local storage as well as the UI
    static handleDeleteOption(project, projectItemDiv) {
        // delete from task form 
        const formParentSelectElem = this.taskForm.querySelector("#parent-project");
        const originalParentOption = formParentSelectElem.querySelector(`option[value="${project.id}"]`);
        originalParentOption.remove();
        // delete the page 
        this.taskSection.querySelector(".page-header").innerHTML = "";
        this.taskSection.querySelector(".project-header-tasks").innerHTML = "";
        // modal to confirm deletion here (optional)
        // delete from storage
        Storage.deleteProject(project.id);
        projectItemDiv.remove();
        
    }
    static loadProjectPage(projectID) {
        const projects = Storage.loadProjects();
        // identify project
        const project = projects.find((proj) => proj.id === projectID);
        this.taskSection.innerHTML = "";
        // project page header
        const projPageHeader = document.createElement("div");
        projPageHeader.classList.add("page-header");
        // project title
        const projPageTitle = document.createElement("div");
        projPageTitle.classList.add("project-header-title");
        projPageTitle.textContent = project.title;
        projPageTitle.setAttribute('data-project-id', projectID); // Add data-project-id attribute
        projPageHeader.appendChild(projPageTitle);
        // project description
        const projPageDescription = document.createElement("div");
        projPageDescription.classList.add("project-header-description");
        projPageDescription.textContent = project.description;
        projPageHeader.appendChild(projPageDescription);
        this.taskSection.appendChild(projPageHeader);

        // create div to contain tasks 
        const projPageTaskList = document.createElement("div");
        projPageTaskList.classList.add("project-header-tasks");
        this.taskSection.appendChild(projPageTaskList);

       // button to add task to this specific project
        project.tasks.forEach((task) => {
            projPageTaskList.appendChild(this.createTaskDiv(task,projectID));
        });
        
    }
}

export default UI;