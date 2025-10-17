import { useState } from "react";
import { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";


const AppContext = createContext()

export const AppContextProvider = ({ children }) => {

    const navigate = useNavigate()
    const [user, setuser] = useState(null)
    const [chats, setchats] = useState([])
    const [selectedChat, setselectedChat] = useState(null)
    const [theme, settheme] = useState(null)
    

const value = {}

    return(
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = ()=> useContext(AppContext)