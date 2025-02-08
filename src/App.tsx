"use client"
import { motion, AnimatePresence } from 'framer-motion'
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import { useState, useEffect } from "react"

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DollarConverter />
    </QueryClientProvider>
  )
}

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeInOut" }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const ColorBackground = () => {
  return (
    <div className="fixed -top-92 inset-0 -z-0 overflow-hidden">
      <div className="relative h-full w-full">
        {/* Base Amber */}
        <motion.div
          className="absolute h-[500px] w-[500px] rounded-full bg-amber-500/30 blur-[64px]"
          animate={{
            x: [-100, 200, -50, 150, -100],
            y: [0, 150, 200, 50, 0],
            scale: [1, 1.2, 0.8, 1.1, 1]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear"
          }}
        />

        {/* Purple */}
        <motion.div
          className="absolute h-[500px] w-[500px] rounded-full bg-purple-500/30 blur-[64px]"
          animate={{
            x: [200, -50, 100, -150, 200],
            y: [150, 50, 200, 100, 150],
            scale: [0.8, 1.1, 0.9, 1.2, 0.8]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear"
          }}
        />

        {/* Pink */}
        <motion.div
          className="absolute h-[500px] w-[500px] rounded-full bg-pink-500/30 blur-[64px]"
          animate={{
            x: [-150, 100, 200, -50, -150],
            y: [200, 100, 50, 150, 200],
            scale: [1.1, 0.8, 1.2, 0.9, 1.1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear"
          }}
        />

        {/* Capa de mezcla */}
        <div className="absolute -top-64 bg-amber-50/50 mix-blend-multiply" />
      </div>
    </div>
  );
};

function DollarConverter() {
  const { isPending, error, data } = useQuery({
    queryKey: ["dollarData"],
    queryFn: () => fetch("https://dollar-api-2025.maikolaguilar656.workers.dev/v1/all").then((res) => res.json()),
    refetchInterval: 60000,
  })

  const [usdAmount, setUsdAmount] = useState<string>("")
  const [vesAmount, setVesAmount] = useState<string>("")
  const [bcvRate, setBcvRate] = useState<number | null>(null)
  const [paraleloRate, setParaleloRate] = useState<number | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [rateMode, setRateMode] = useState<"bcv" | "paralelo" | "promedio">("bcv")

  useEffect(() => {
    if (data) {
      setBcvRate(data.bcv.precio_bcv)
      setParaleloRate(data.paralelo.precio_paralelo)
      setLastUpdate(new Date(data.bcv.fecha_actualizacion))
    }
  }, [data])

  const currentRate = rateMode === "promedio" && bcvRate && paraleloRate 
    ? (bcvRate + paraleloRate) / 2 
    : rateMode === "bcv" 
      ? bcvRate 
      : paraleloRate

  const handleUsdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (isNaN(Number(value))) return
    setUsdAmount(value)
    currentRate && setVesAmount((Number(value) * currentRate).toFixed(2))
  }

  const handleVesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (isNaN(Number(value))) return
    setVesAmount(value)
    currentRate && setUsdAmount((Number(value) / currentRate).toFixed(2))
  }


  useEffect(() => {
    if (currentRate) {
      if (usdAmount) {
        setVesAmount((Number(usdAmount) * currentRate).toFixed(2))
      } else if (vesAmount) {
        setUsdAmount((Number(vesAmount) / currentRate).toFixed(2))
      }
    }
  }, [currentRate])

  if (isPending) return <div className="text-center p-4 text-white">Cargando precios del dólar...</div>

  if (error)
    return (
      <div className="text-center p-4 text-red-400">
        Ocurrió un error al cargar los precios del dólar: {error.message}
      </div>
    )

  if (!bcvRate) return <div className="text-center p-4 text-yellow-400">No se pudo obtener la tasa del BCV.</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-900 flex items-center justify-center p-4">
  <motion.div
    initial="hidden"
    animate="visible"
    variants={containerVariants}
    className="w-full max-w-xl bg-zinc-800 bg-opacity-70 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden"
  >
    <ColorBackground/>
    <div className="p-8 bg-zinc-900">
      <motion.h1
        className="relative text-2xl md:text-4xl lg:text-6xl z-10 font-bold text-center text-white mb-8"
        variants={itemVariants}
      >
        Calculadora de Dólares
      </motion.h1>

      <motion.div
        className="flex flex-col items-center mb-6 gap-4"
        variants={itemVariants}
      >
        <div className="relative w-full flex justify-center">
          <motion.div
            className="relative w-full mx-6 h-12 bg-zinc-700 rounded-full flex items-center justify-between px-2"
            whileHover={{ scale: 1.05 }}
            role="radiogroup" // Añadido role radiogroup para agrupar los botones de tasa
            aria-label="Modo de Tasa de Cambio" // Añadido aria-label para describir el grupo de botones
          >
            {/* Botón BCV */}
            <motion.button
              onClick={() => setRateMode("bcv")}
              className="relative z-10 w-1/3 h-10 flex items-center justify-center"
              whileTap={{ scale: 0.95 }}
              role="radio" // Añadido role radio para indicar que es un botón de radio
              aria-checked={rateMode === "bcv"} // Añadido aria-checked para indicar el estado seleccionado
              aria-label="Tasa BCV" // Añadido aria-label para describir el botón
            >
              <span className={`lg:text-xl text-xs md:text-medium  ${rateMode === "bcv" ? "text-blue-100 font-bold" : "text-zinc-300"}`}>BCV</span>
            </motion.button>

            {/* Botón Paralelo */}
            <motion.button
              onClick={() => setRateMode("paralelo")}
              className="relative z-10 w-1/3 h-10 flex items-center justify-center"
              whileTap={{ scale: 0.95 }}
              role="radio" // Añadido role radio
              aria-checked={rateMode === "paralelo"} // Añadido aria-checked
              aria-label="Tasa Paralelo" // Añadido aria-label
            >
              <span className={`lg:text-xl text-xs md:text-medium   ${rateMode === "paralelo" ? "text-blue-100 font-bold" : "text-zinc-300"}`}>PARALELO</span>
            </motion.button>

            {/* Botón Promedio */}
            <motion.button
              onClick={() => setRateMode("promedio")}
              className="relative z-10 w-1/3 h-10 flex items-center justify-center"
              whileTap={{ scale: 0.95 }}
              role="radio" // Añadido role radio
              aria-checked={rateMode === "promedio"} // Añadido aria-checked
              aria-label="Tasa Promedio" // Añadido aria-label
            >
              <span className={`lg:text-xl text-xs md:text-medium   ${rateMode === "promedio" ? "text-blue-100 font-bold" : "text-zinc-300"}`}>PROMEDIO</span>
            </motion.button>

            {/* Indicador de selección */}
            <motion.div
              className="absolute bg-blue-600 w-1/3 h-10 rounded-full shadow-md"
              animate={{
                left: rateMode === "bcv" ? "4px" :
                  rateMode === "paralelo" ? "33%" : "66%"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          </motion.div>
        </div>
      </motion.div>

      <div className="space-y-6 ">
        <motion.div
          className="relative"
          variants={itemVariants}
        >
          <input
            type="tel"
            id="usdAmount"
            placeholder="0"
            value={usdAmount}
            onChange={handleUsdChange}
            className=" w-full bg-zinc-700 bg-opacity-50 text-white text-2xl rounded-2xl px-6 pt-8 pb-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
            aria-describedby="usdAmountLabel" //Conectar input y label programaticamente
          />
          <motion.label
            htmlFor="usdAmount"
            className="absolute left-6 top-2 text-xs font-semibold text-blue-400"
            whileHover={{ y: -2 }}
            id="usdAmountLabel" // Añadido ID para describir el input
          >
            Dólares (USD)
          </motion.label>
        </motion.div>

        <motion.div
          className="relative"
          variants={itemVariants}
        >
          <input
            type="tel"
            id="vesAmount"
            placeholder="0"
            value={vesAmount}
            onChange={handleVesChange}
            className="   w-full bg-zinc-700 bg-opacity-50 text-white text-2xl rounded-2xl px-6 pt-8 pb-2 outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 ease-in-out"
            aria-describedby="vesAmountLabel" //Conectar input y label programaticamente
          />
          <motion.label
            htmlFor="vesAmount"
            className="absolute left-6 top-2 text-xs font-semibold text-green-400"
            whileHover={{ y: -2 }}
            id="vesAmountLabel" // Añadido ID para describir el input
          >
            Bolívares (VES)
          </motion.label>
        </motion.div>
      </div>

      <motion.div
        className="mt-8 space-y-2 text-lg "
        variants={containerVariants}
        aria-live="polite" // Añadido aria-live para anunciar cambios de tasa
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRate?.toString() || "rate"}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex justify-between items-center "
          >
            <span className="text-zinc-400">Tasa Actual:</span>
            <span className="text-white font-medium">
              {rateMode === "promedio" && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-2 text-xs text-green-400"
                >
                  (Promedio)
                </motion.span>
              )} {
                " "
              }
              {currentRate?.toLocaleString("es-VE", {
                style: "currency",
                currency: "VES"
              })}

            </span>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center ">
          <span className="text-zinc-400">Tasa BCV:</span>
          <span className="text-white font-medium">
            {bcvRate?.toLocaleString("es-VE", { style: "currency", currency: "VES" })}
          </span>
        </div>
        <div className="flex justify-between items-center ">
          <span className="text-zinc-400">Tasa Paralelo:</span>
          <span className="text-white font-medium">
            {paraleloRate?.toLocaleString("es-VE", { style: "currency", currency: "VES" })}
          </span>
        </div>
        {lastUpdate && (
          <motion.div
            className="text-sm font-medium text-zinc-500 text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            aria-live="polite" // Añadido aria-live para anunciar la actualización
          >
            Última actualización: {lastUpdate.toLocaleDateString()} {lastUpdate.toLocaleTimeString()}
          </motion.div>
        )}
      </motion.div>
    </div>

    <motion.div
      className="bg-zinc-900 bg-opacity-50 p-4 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
    >
      <a
        href="http://127.0.0.1:8787/v1/all"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-300"
      >
        Fuente de precios: API de Precios
      </a>
    </motion.div>
  </motion.div>
</div>
  )
}