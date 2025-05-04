import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa'

const edificios = [
  'Edificio 1', 'Edificio 2', 'Edificio 3', 'Edificio 4',
  'Edificio 5', 'Edificio 6', 'Edificio 7', 'Edificio 8'
]

const salonesPorEdificio = {
  'Edificio 1': ['Salón 101', 'Salón 102'],
  'Edificio 2': ['Salón 201', 'Salón 202'],
  'Edificio 3': ['Salón 301', 'Salón 302'],
  'Edificio 4': ['Salón 401', 'Salón 402'],
  'Edificio 5': ['Salón 501', 'Salón 502'],
  'Edificio 6': ['Salón 601', 'Salón 602'],
  'Edificio 7': ['Salón 701', 'Salón 702'],
  'Edificio 8': ['Salón 801', 'Salón 802']
}

const ChatPrompt = () => {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversations, setConversations] = useState([])
  const [edificioSeleccionado, setEdificioSeleccionado] = useState('Edificio 1')
  const conversationsEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (conversationsEndRef.current) {
      conversationsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conversations])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    try {
      setIsLoading(true)
      const newConversations = [...conversations, { role: 'user', content: prompt }]
      setConversations(newConversations)
      setPrompt('')

      const res = await axios.post('https://edificios-back.vercel.app/api/chat', { prompt })
      setConversations([
        ...newConversations,
        { role: 'assistant', content: res.data.response }
      ])
    } catch (error) {
      console.error('Error:', error)
      setConversations([
        ...conversations,
        { role: 'user', content: prompt },
        { role: 'system', content: 'Lo siento, hubo un error. Intenta nuevamente. 😕' }
      ])
      setPrompt('')
    } finally {
      setIsLoading(false)
      if (textareaRef.current) textareaRef.current.focus()
    }
  }

  const formatText = (text) => {
    return text.split('\n').map((p, i) => (
      <p key={i} className="mb-2">{p}</p>
    ))
  }

  return (
    <div className="bg-[#F0F8FF] min-h-screen flex flex-col items-center justify-start p-4 font-sans">
      {/* Encabezado principal */}
      <div className="w-full max-w-6xl rounded-t-lg bg-[#003366] text-white text-center py-4 shadow-md">
        <h1 className="text-2xl font-bold">Universidad Javeriana de Cali</h1>
        <p className="text-sm">Sistema de Navegación de Campus</p>
      </div>

      {/* Contenedor principal */}
      <div className="w-full max-w-6xl bg-white shadow-xl rounded-b-lg flex flex-col md:flex-row overflow-hidden">

        {/* Columna izquierda - Chat */}
        <div className="md:w-2/3 p-4 bg-gradient-to-b from-blue-50 to-white flex flex-col border-r border-blue-200">
          {/* Header del chat */}
          <div className="bg-blue-700 text-white p-3 rounded-md mb-4 flex items-center justify-center shadow">
            <FaRobot className="mr-2" /> <span className="font-semibold">Asistente Virtual</span>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto h-[350px] px-2">
            {conversations.length === 0 ? (
              <div className="text-center text-blue-800">
                <div className="p-4 mb-2">
                  <FaRobot className="text-4xl mx-auto mb-2" />
                  <h2 className="text-xl font-bold">¡Bienvenido al Chat! 👋</h2>
                  <p className="text-blue-600">¿En qué puedo ayudarte hoy?</p>
                </div>
              </div>
            ) : (
              conversations.map((msg, idx) => (
                <div key={idx} className={`my-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-lg max-w-[80%] text-sm shadow ${
                    msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' :
                    msg.role === 'system' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}>
                    <div className="font-semibold mb-1 flex items-center">
                      {msg.role === 'user' && <><FaUser className="mr-1" /> Tú</>}
                      {msg.role === 'assistant' && <><FaRobot className="mr-1 text-blue-600" /> ChatGPT</>}
                      {msg.role === 'system' && 'Sistema'}
                    </div>
                    {formatText(msg.content)}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="text-blue-600 text-sm mt-2">Escribiendo...</div>
            )}
            <div ref={conversationsEndRef} />
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="mt-4">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              rows="2"
              placeholder="Escribe tu mensaje aquí..."
              disabled={isLoading}
              className="w-full p-3 border border-blue-300 rounded-md resize-none shadow-inner"
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="mt-2 w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center transition disabled:opacity-50"
            >
              <FaPaperPlane className="mr-2" /> Enviar
            </button>
            <p className="text-center text-xs text-blue-600 mt-1">
              {isLoading ? '⏳ Procesando...' : 'Presiona Enter para enviar'}
            </p>
          </form>
        </div>

        {/* Columna derecha - Navegación */}
        <div className="md:w-1/3 p-4 bg-blue-50">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Navegación de Campus</h2>

          <label className="block text-sm font-medium text-blue-700 mb-1">Selecciona un edificio:</label>
          <select
            value={edificioSeleccionado}
            onChange={(e) => setEdificioSeleccionado(e.target.value)}
            className="w-full p-2 border border-blue-300 rounded-md mb-4 bg-white shadow-sm"
          >
            {edificios.map((e, idx) => (
              <option key={idx} value={e}>{e}</option>
            ))}
          </select>

          <h3 className="font-semibold text-blue-800 mb-2">Salones disponibles:</h3>
          <div className="grid grid-cols-2 gap-3">
            {salonesPorEdificio[edificioSeleccionado]?.map((salon, i) => (
              <div key={i} className="bg-white border border-blue-200 rounded-lg shadow p-2 flex flex-col items-center text-center">
                <div className="h-20 w-full bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-500 text-sm">
                  Imagen {salon}
                </div>
                <span className="text-blue-700 font-medium">{salon}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-white rounded-lg shadow text-sm text-gray-700">
            <h4 className="font-bold text-blue-800 mb-1">Universidad Javeriana de Cali</h4>
            <p>
              Fundada en 1970, la Pontificia Universidad Javeriana de Cali es una institución de educación superior privada colombiana de tradición jesuita.
              Comprometida con la excelencia académica y la formación integral de sus estudiantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPrompt
