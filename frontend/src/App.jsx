import { useState } from 'react'

import './App.css'
import { LoginPage } from '../components/LoginPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="spacer">
        <LoginPage />
      </section>
    </>
  )
}

export default App
