 const ProjectContext = createContext();
  
 const initialProjectState = {
   projects: [],
   currentProject: null,
   loading: false,
   error: null
 };
 
 const projectReducer = (state, action) => {
   switch (action.type) {
     case ActionTypes.SET_PROJECTS:
       return {
         ...state,
         projects: action.payload,
         loading: false
       };
     case ActionTypes.ADD_PROJECT:
       return {
         ...state,
         projects: [...state.projects, action.payload]
       };
     case ActionTypes.UPDATE_PROJECT:
       return {
         ...state,
         projects: state.projects.map(project => 
           project.id === action.payload.id ? action.payload : project
         )
       };
     case ActionTypes.DELETE_PROJECT:
       return {
         ...state,
         projects: state.projects.filter(project => 
           project.id !== action.payload
         )
       };
     case ActionTypes.SET_CURRENT_PROJECT:
       return {
         ...state,
         currentProject: action.payload
       };
     default:
       return state;
   }
 };
 
 export const ProjectProvider = ({ children }) => {
   const [state, dispatch] = useReducer(projectReducer, initialProjectState);
 
   const loadProjects = async () => {
     try {
       dispatch({ type: ActionTypes.SET_LOADING, payload: true });
       const projects = await endpoints.projects.getAll();
       dispatch({ type: ActionTypes.SET_PROJECTS, payload: projects });
     } catch (error) {
       dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
     }
   };
 
   const createProject = async (projectData) => {
     try {
       const newProject = await endpoints.projects.create(projectData);
       dispatch({ type: ActionTypes.ADD_PROJECT, payload: newProject });
       return newProject;
     } catch (error) {
       dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
       throw error;
     }
   };
 
   const updateProject = async (id, projectData) => {
     try {
       const updatedProject = await endpoints.projects.update(id, projectData);
       dispatch({ type: ActionTypes.UPDATE_PROJECT, payload: updatedProject });
       return updatedProject;
     } catch (error) {
       dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
       throw error;
     }
   };
 
   return (
     <ProjectContext.Provider 
       value={{ 
         ...state, 
         loadProjects, 
         createProject, 
         updateProject 
       }}
     >
       {children}
     </ProjectContext.Provider>
   );
 };
 