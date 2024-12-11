 // src/context/SymbolContext.jsx
 const SymbolContext = createContext();
  
 const initialSymbolState = {
   symbols: [],
   symbolsByType: {},
   loading: false,
   error: null
 };
 
 const symbolReducer = (state, action) => {
   switch (action.type) {
     case ActionTypes.SET_SYMBOLS:
       return {
         ...state,
         symbols: action.payload,
         loading: false
       };
     case ActionTypes.ADD_SYMBOL:
       return {
         ...state,
         symbols: [...state.symbols, action.payload]
       };
     case ActionTypes.UPDATE_SYMBOL:
       return {
         ...state,
         symbols: state.symbols.map(symbol => 
           symbol.id === action.payload.id ? action.payload : symbol
         )
       };
     case ActionTypes.DELETE_SYMBOL:
       return {
         ...state,
         symbols: state.symbols.filter(symbol => 
           symbol.id !== action.payload
         )
       };
     default:
       return state;
   }
 };
 
 export const SymbolProvider = ({ children }) => {
   const [state, dispatch] = useReducer(symbolReducer, initialSymbolState);
 
   const loadSymbols = async (projectId) => {
     try {
       dispatch({ type: ActionTypes.SET_LOADING, payload: true });
       const symbols = await endpoints.symbols.getAll({ projectId });
       dispatch({ type: ActionTypes.SET_SYMBOLS, payload: symbols });
     } catch (error) {
       dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
     }
   };
 
   const createSymbol = async (symbolData) => {
     try {
       const newSymbol = await endpoints.symbols.create(symbolData);
       dispatch({ type: ActionTypes.ADD_SYMBOL, payload: newSymbol });
       return newSymbol;
     } catch (error) {
       dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
       throw error;
     }
   };
 
   return (
     <SymbolContext.Provider 
       value={{ 
         ...state, 
         loadSymbols, 
         createSymbol 
       }}
     >
       {children}
     </SymbolContext.Provider>
   );
 };
 