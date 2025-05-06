import ChatPrompt from './components/ChatPrompt'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-blue-100 flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold text-blue-600 mb-4 mt-2">
  Bienvenidos a
</h1>


      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col">
        <div className="flex-1 flex flex-col pb-4">
          <ChatPrompt />
        </div>
        
        <p className="text-center text-blue-600 font-medium text-sm my-2">
  Desarrollado como parcial II - ECONOMIA DIGITAL 🤖
</p>

      </div>
    </div>
  )
}

export default App
