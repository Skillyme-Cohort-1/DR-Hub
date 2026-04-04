import { Stepper } from './../components/Stepper';

function App() {
  return (
    <>
      
      <Stepper steps={['Select Room', 'Choose Date', 'Confirm Details', 'Upload Document' ]} currentStep={0} />
    </>
  )
}

export default App
