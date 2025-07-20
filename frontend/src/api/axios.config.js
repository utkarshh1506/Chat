import axios from 'axios'

const instance = axios.create({
    baseURL : 'https://chat-xiey.onrender.com',
    withCredentials: true
})

export default instance