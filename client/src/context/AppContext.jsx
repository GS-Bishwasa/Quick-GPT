import { useState } from "react";
import { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {dummyUserData,  dummyChats } from "../assets/assets.js"
import { useEffect } from "react";


const AppContext = createContext()

export const AppContextProvider = ({ children }) => {

    const navigate = useNavigate()
    const [user, setuser] = useState(null)
    const [chats, setchats] = useState([])
    const [selectedChat, setselectedChat] = useState(null)
    const [theme, settheme] = useState(localStorage.getItem("theme") || "light")
    
    const fetchUser = async ()=>{
        setuser(dummyUserData)
    }

    useEffect(() => {
      fetchUser()
    }, [])

    const fetchUsersChats = async ()=>{
        setchats(dummyChats)
        setselectedChat(dummyChats[0])
    }

    useEffect(() => {
        if (user) {
            fetchUsersChats()
        }else{
            setchats([])
            setselectedChat(null)
        }
    }, [user])

    useEffect(() => {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      }else{
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
    }, [theme])
    

const value = {
    navigate,user,setuser, fetchUser, chats, setchats, selectedChat, setselectedChat, theme, settheme
}

    return(
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = ()=> useContext(AppContext)