
  // src/context/UIContext.jsx
  const UIContext = createContext();
  
  const initialUIState = {
    sidebarOpen: true,
    currentModal: null,
    loading: false,
    notifications: []
  };
  
  const uiReducer = (state, action) => {
    switch (action.type) {
      case 'TOGGLE_SIDEBAR':
        return {
          ...state,
          sidebarOpen: !state.sidebarOpen
        };
      case 'SET_MODAL':
        return {
          ...state,
          currentModal: action.payload
        };
      case 'ADD_NOTIFICATION':
        return {
          ...state,
          notifications: [...state.notifications, action.payload]
        };
      case 'REMOVE_NOTIFICATION':
        return {
          ...state,
          notifications: state.notifications.filter(
            notif => notif.id !== action.payload
          )
        };
      default:
        return state;
    }
  };
  
  export const UIProvider = ({ children }) => {
    const [state, dispatch] = useReducer(uiReducer, initialUIState);
  
    return (
      <UIContext.Provider value={{ ...state, dispatch }}>
        {children}
      </UIContext.Provider>
    );
  };
  
  // Custom hooks for using contexts
  export const useAuth = () => useContext(AuthContext);
  export const useProject = () => useContext(ProjectContext);
  export const useSymbol = () => useContext(SymbolContext);
  export const useUI = () => useContext(UIContext);
  
  // Combine all providers
  export const AppProvider = ({ children }) => (
    <AuthProvider>
      <ProjectProvider>
        <SymbolProvider>
          <UIProvider>
            {children}
          </UIProvider>
        </SymbolProvider>
      </ProjectProvider>
    </AuthProvider>
  );