import React from 'react'
import { BrowserRouter, Routes, Route, Router, useNavigate } from 'react-router-dom'

import HomePage from './Components/HomePage'


function App() {
  

  return (
    <>
      <Routes>
        <Route path='/' Component={HomePage} />
      </Routes>
    </>
  )
}

export default App;
