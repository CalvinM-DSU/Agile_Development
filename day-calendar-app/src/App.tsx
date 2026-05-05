import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
// WILL : IMPORTING MY DAILY TIMELINE HERE
import DayTimeline from './Components/DayTimeline' 


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        {/*WILL : including my daily timeline component here */}
         <DayTimeline /> 
        
      </section>
    </>
  )
}

export default App
