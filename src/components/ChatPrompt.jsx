"use client"

import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { FaPaperPlane, FaRobot, FaUser, FaQuestionCircle, FaTimes, FaMapMarkerAlt, FaBuilding } from "react-icons/fa"

const ChatPrompt = () => {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversations, setConversations] = useState([])
  const [edificioSeleccionado, setEdificioSeleccionado] = useState("")
  const [showHelpCloud, setShowHelpCloud] = useState(false)
  const [salonSeleccionado, setSalonSeleccionado] = useState(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const conversationsEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Estados para manejar los datos de MongoDB
  const [edificios, setEdificios] = useState([])
  const [salonesPorEdificio, setSalonesPorEdificio] = useState({})
  const [cargandoEdificios, setCargandoEdificios] = useState(true)
  const [cargandoSalones, setCargandoSalones] = useState(false)

  // Función para obtener los edificios únicos
  const obtenerEdificios = async () => {
    try {
      setCargandoEdificios(true)
      const response = await axios.get("https://edificios-back.vercel.app/api/chat/edificios")
      //const response = await axios.get("http://localhost:5000/api/chat/edificios")
      console.log("Datos de aulas:", response.data)
      console.log("Edificio seleccionado:", edificioSeleccionado)
      console.log("Claves de salonesPorEdificio:", Object.keys(salonesPorEdificio))

      const edificiosUnicos = [...new Set(response.data)] //Se modifoca el dato a responder
      setEdificios(edificiosUnicos)

      if (edificiosUnicos.length > 0) {
        setEdificioSeleccionado(edificiosUnicos[0])
      }
      setCargandoEdificios(false)
    } catch (error) {
      console.error("Error al obtener edificios:", error)
      setCargandoEdificios(false)
    }
  }

  const obtenerSalonesPorEdificio = async (edificio) => {
    try {
      setCargandoSalones(true)
      const response = await axios.get(`https://edificios-back.vercel.app/api/chat/aulas/edificio/${edificio}`)
      //const response = await axios.get(`http://localhost:5000/api/chat/aulas/edificio/${edificio}`)
      // Guardar todos los datos del salón según la estructura de MongoDB
      const salones = response.data.map((aula) => ({
        nombre: aula.nombre_salon,
        imagen: aula.imagenUrl || "/placeholder.svg?height=160&width=320",
        piso: aula.piso || "No especificado",
        capacidad_nominal: aula.capacidad_nominal || "No especificada",
        puestos_contados: aula.puestos_contados || "No especificados",
        tipo_aula: aula.tipo_aula || "No especificado",
        tipo_mesa: aula.tipo_mesa || "No especificado",
        tipo_silla: aula.tipo_silla || "No especificado",
        tipo_tablero: aula.tipo_tablero || "No especificado",
        equipamiento_tecnologico: aula.equipamiento_tecnologico || "No especificado",
        tomacorriente: aula.tomacorriente || "No especificado",
        movilidad: aula.movilidad || "No especificado",
        entorno: aula.entorno || "No especificado",
        comentarios: aula.comentarios || "No hay comentarios disponibles",
      }))

      setSalonesPorEdificio((prevState) => ({
        ...prevState,
        [edificio]: salones,
      }))
      setCargandoSalones(false)
    } catch (error) {
      console.error(`Error al obtener salones para ${edificio}:`, error)
      setCargandoSalones(false)
    }
  }

  useEffect(() => {
    if (conversationsEndRef.current) {
      conversationsEndRef.current.scrollIntoView({ behavior: "smooth" })
    }

    // Cargar edificios al iniciar
    obtenerEdificios()
  }, [])

  useEffect(() => {
    if (edificioSeleccionado && !salonesPorEdificio[edificioSeleccionado]) {
      obtenerSalonesPorEdificio(edificioSeleccionado)
    }
  }, [edificioSeleccionado])

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    try {
      setIsLoading(true)
      const newConversations = [...conversations, { role: "user", content: prompt }]
      setConversations(newConversations)
      setPrompt("")

      const res = await axios.post("https://edificios-back.vercel.app/api/chat", { prompt })
      //const res = await axios.post("http://localhost:5000/api/chat", { prompt })
      setConversations([...newConversations, { role: "assistant", content: res.data.response }])
    } catch (error) {
      console.error("Error:", error)
      setConversations([
        ...conversations,
        { role: "user", content: prompt },
        { role: "system", content: "Lo siento, hubo un error. Intenta nuevamente. 😕" },
      ])
      setPrompt("")
    } finally {
      setIsLoading(false)
      if (textareaRef.current) textareaRef.current.focus()
    }
  }

  const formatText = (text) => {
    return text.split("\n").map((p, i) => (
      <p key={i} className="mb-2">
        {p}
      </p>
    ))
  }

  const mostrarDetallesSalon = (salon) => {
    setSalonSeleccionado(salon)
    setMostrarModal(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 font-sans">
      {/* Header con logo y título */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-[#003B71] text-white rounded-lg shadow-lg p-4 flex items-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mr-4 overflow-hidden">
            <img
              src="https://javeriana-edificios.s3.us-east-2.amazonaws.com/logo_javeriana.jpeg"
              alt="Logo de la universidad"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Universidad Javeriana de Cali</h1>
            <p className="text-blue-200 text-sm">Sistema de Navegación de Campus</p>
          </div>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {/* Columna izquierda - Chat */}
        <div className="md:col-span-1 bg-white rounded-lg shadow-lg overflow-hidden border border-blue-100">
          <div className="bg-[#003B71] text-white p-3 flex items-center justify-center">
            <FaRobot className="mr-2" />
            <h2 className="font-bold">Asistente Virtual</h2>
          </div>

          <div className="h-[400px] overflow-y-auto p-4">
            {conversations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <FaRobot className="text-[#003B71] text-2xl" />
                </div>
                <h3 className="text-lg font-bold text-[#003B71]">¡Bienvenido al Chat!</h3>
                <p className="text-blue-600 text-sm mt-2">¿En qué puedo ayudarte hoy?</p>
              </div>
            ) : (
              <div className="space-y-4">
                {conversations.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] p-3 rounded-lg shadow ${
                        msg.role === "user"
                          ? "bg-[#003B71] text-white rounded-tr-none"
                          : msg.role === "system"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-50 text-gray-800 rounded-tl-none"
                      }`}
                    >
                      <div className="flex items-center mb-1 text-sm font-medium">
                        {msg.role === "user" ? (
                          <>
                            <FaUser className="mr-1" /> <span>Tú</span>
                          </>
                        ) : msg.role === "system" ? (
                          "Sistema"
                        ) : (
                          <>
                            <FaRobot className="mr-1 text-[#003B71]" />{" "}
                            <span className="text-[#003B71]">Asistente</span>
                          </>
                        )}
                      </div>
                      <div className="text-sm">{formatText(msg.content)}</div>
                    </div>
                  </div>
                ))}
                <div ref={conversationsEndRef} />
              </div>
            )}
            {isLoading && (
              <div className="flex justify-start mt-4">
                <div className="max-w-[85%] p-3 bg-blue-50 rounded-lg rounded-tl-none shadow">
                  <div className="flex items-center mb-1 text-sm font-medium">
                    <FaRobot className="mr-1 text-[#003B71]" /> <span className="text-[#003B71]">Asistente</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-blue-100">
            <form onSubmit={handleSubmit}>
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu mensaje aquí..."
                className="w-full p-3 border border-blue-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="mt-2 w-full bg-[#003B71] hover:bg-blue-800 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPaperPlane className="mr-2" /> Enviar
              </button>
              <p className="text-xs text-center text-blue-500 mt-1">
                {isLoading ? "⏳ Procesando..." : "💬 Presiona Enter para enviar"}
              </p>
            </form>
          </div>
        </div>

        {/* Columna central - Selector de edificios */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-lg p-5 border border-blue-100">
          <h2 className="text-xl font-bold text-[#003B71] mb-4 flex items-center">
            <FaBuilding className="mr-2" /> Navegación de Campus
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#003B71] mb-2">Selecciona un edificio:</label>
            {cargandoEdificios ? (
              <div className="w-full p-3 border border-blue-300 rounded-lg bg-white shadow-sm text-center">
                <div className="flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            ) : (
              <select
                value={edificioSeleccionado}
                onChange={(e) => setEdificioSeleccionado(e.target.value)}
                className="w-full p-3 border border-blue-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {edificios.map((edificio, i) => (
                  <option key={i} value={edificio}>
                    {edificio}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#003B71] mb-3 flex items-center">
              <FaMapMarkerAlt className="mr-2" /> Salones disponibles
            </h3>
            {cargandoSalones || !salonesPorEdificio[edificioSeleccionado] ? (
              <div className="bg-white border border-blue-200 rounded-lg p-8 text-center">
                <div className="flex justify-center space-x-2 mb-3">
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                  <div
                    className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
                <p className="text-blue-600">Cargando salones...</p>
              </div>
            ) : salonesPorEdificio[edificioSeleccionado].length === 0 ? (
              <div className="bg-white border border-blue-200 rounded-lg p-8 text-center">
                <p className="text-gray-600">No hay salones disponibles para este edificio</p>
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {salonesPorEdificio[edificioSeleccionado].map((salon, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-blue-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all"
                    >
                      <div
                        className="h-40 bg-blue-50 relative cursor-pointer salon-image-container"
                        onClick={() => mostrarDetallesSalon(salon)}
                      >
                        <img
                          src={salon.imagen || "/placeholder.svg"}
                          alt={salon.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 text-center">
                        <h4 className="font-medium text-[#003B71]">{salon.nombre}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Leyenda Universidad Javeriana */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-bold text-[#003B71] mb-2">Universidad Javeriana de Cali</h3>
            <p className="text-sm text-gray-700">
              Fundada en 1970, la Pontificia Universidad Javeriana de Cali es una institución de educación superior
              privada colombiana de tradición jesuita. Comprometida con la excelencia académica y la formación integral
              de sus estudiantes, se destaca por su campus moderno y sus programas de alta calidad.
            </p>
          </div>
        </div>

        {/* Botón de ayuda flotante */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setShowHelpCloud(!showHelpCloud)}
            className="w-12 h-12 bg-[#003B71] hover:bg-blue-800 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
            aria-label="Ayuda"
          >
            {showHelpCloud ? <FaTimes /> : <FaQuestionCircle />}
          </button>

          {showHelpCloud && (
            <div className="absolute top-14 right-0 w-64 bg-white p-4 rounded-lg shadow-xl border border-blue-200 cloud-shape">
              <h4 className="font-bold text-[#003B71] mb-3">Opciones de Ayuda</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-[#003B71] font-bold">1</span>
                  </div>
                  <span>Selecciona un edificio para ver sus salones disponibles</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-[#003B71] font-bold">2</span>
                  </div>
                  <span>Usa el chat para preguntar sobre ubicaciones o servicios</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-[#003B71] font-bold">3</span>
                  </div>
                  <span>Explora las imágenes de los salones para familiarizarte con ellos</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles del salón */}
      {mostrarModal && salonSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 salon-modal-overlay">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto salon-modal">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-[#003B71]">{salonSeleccionado.nombre}</h2>
                <button
                  onClick={() => setMostrarModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="mb-6 rounded-lg overflow-hidden border border-blue-200 salon-image-container">
                <img
                  src={salonSeleccionado.imagen || "/placeholder.svg"}
                  alt={salonSeleccionado.nombre}
                  className="w-full h-64 object-cover"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg salon-detail-card">
                  <h3 className="salon-detail-title">Piso</h3>
                  <p className="salon-detail-value">{salonSeleccionado.piso}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg salon-detail-card">
                  <h3 className="salon-detail-title">Capacidad Nominal</h3>
                  <p className="salon-detail-value">{salonSeleccionado.capacidad_nominal}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg salon-detail-card">
                  <h3 className="salon-detail-title">Puestos Contados</h3>
                  <p className="salon-detail-value">{salonSeleccionado.puestos_contados}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg salon-detail-card">
                  <h3 className="salon-detail-title">Tipo de Aula</h3>
                  <p className="salon-detail-value">{salonSeleccionado.tipo_aula}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg salon-detail-card">
                  <h3 className="salon-detail-title">Tipo de Mesa</h3>
                  <p className="salon-detail-value">{salonSeleccionado.tipo_mesa}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg salon-detail-card">
                  <h3 className="salon-detail-title">Tipo de Silla</h3>
                  <p className="salon-detail-value">{salonSeleccionado.tipo_silla}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg salon-detail-card">
                  <h3 className="salon-detail-title">Tipo de Tablero</h3>
                  <p className="salon-detail-value">{salonSeleccionado.tipo_tablero}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg salon-detail-card">
                  <h3 className="salon-detail-title">Equipamiento Tecnológico</h3>
                  <p className="salon-detail-value">{salonSeleccionado.equipamiento_tecnologico}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg salon-detail-card">
                  <h3 className="salon-detail-title">Tomacorriente</h3>
                  <p className="salon-detail-value">{salonSeleccionado.tomacorriente}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg salon-detail-card">
                  <h3 className="salon-detail-title">Movilidad</h3>
                  <p className="salon-detail-value">{salonSeleccionado.movilidad}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg salon-detail-card">
                  <h3 className="salon-detail-title">Entorno</h3>
                  <p className="salon-detail-value">{salonSeleccionado.entorno}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg salon-detail-card">
                  <h3 className="salon-detail-title">Edificio</h3>
                  <p className="salon-detail-value">{edificioSeleccionado}</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-6 salon-detail-card">
                <h3 className="salon-detail-title">Comentarios</h3>
                <p className="salon-detail-value">{salonSeleccionado.comentarios}</p>
              </div>

              <button onClick={() => setMostrarModal(false)} className="w-full action-button">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatPrompt
