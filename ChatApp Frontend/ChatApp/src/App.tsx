import {ChatRoom} from '../pages/LandingPage'
import './App.css'
import {BrowserRouter,Routes,Route} from 'react-router-dom'

function App() {

  return (
      <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChatRoom />} />
        </Routes>
      </BrowserRouter>
      </>
  )
}

export default App
