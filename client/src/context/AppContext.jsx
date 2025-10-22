import { useState } from "react";
import { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { dummyUserData, dummyChats } from "../assets/assets.js"
import { useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL


const AppContext = createContext()

export const AppContextProvider = ({ children }) => {

    const navigate = useNavigate()
    const [user, setuser] = useState(null)
    const [chats, setchats] = useState([])
    const [selectedChat, setselectedChat] = useState(null)
    const [theme, settheme] = useState(localStorage.getItem("theme") || "light")
    const [token, settoken] = useState(localStorage.getItem("token") || null)
    const [loadingUser, setloadingUser] = useState(true)


    const fetchUser = async () => {
        try {
            const { data } = await axios.get('/api/user/data', { headers: { Authorization: token } })
            if (data.success) {
                setuser(data.user)
            } else {
                toast.error("Please login to access your account")
            }

        } catch (error) {
            toast.error(error.message)
        } finally {
            setloadingUser(false)
        }
    }

    const createNewChat = async () => {
        try {
            if (!user) {
                return toast('Login to create a new chat')
            }
            navigate('/')
            await axios.get('/api/chat/create', { headers: { Authorization: token } })
            await fetchUsersChats()
        } catch (error) {
            toast.error(error.message)
        }
    }


    const fetchUsersChats = async () => {
        try {
            const { data } = await axios.get('/api/chat/get', { headers: { Authorization: token } })
            if (data.success) {
                setchats(data.chats)
                // if the user has no chats, create a new one
                if (data.chats.length === 0) {
                    await createNewChat()
                    return fetchUsersChats()
                }else{
                    setselectedChat(data.chats[0])
                }
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (token) {
            fetchUser()
        }else{
            setuser(null)
            setloadingUser(false)
        }
    }, [token])



    useEffect(() => {
        if (user) {
            fetchUsersChats()
        } else {
            setchats([])
            setselectedChat(null)
        }
    }, [user])

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme])


    const value = {
        navigate, user, setuser, fetchUser, chats, setchats, selectedChat, setselectedChat, theme, settheme,createNewChat, loadingUser, fetchUsersChats, token, settoken, axios
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext)