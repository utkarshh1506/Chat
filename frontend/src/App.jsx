import React from 'react'
import {Route, Routes} from 'react-router-dom'
import HomePage from './Pages/HomePage'
import LoginPage from './Pages/LoginPage'
import ProfilePage from './Pages/ProfilePage'
import './App.css'
import CreateRoom from './Pages/CreateRoom'

const App = () => {
  return (
    <div className='app-wrapper'>
      <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/profile' element={<ProfilePage/>}/>
        <Route path='/create-room' element={<CreateRoom/>}/>
      </Routes>
    </div>
  )
}

export default App