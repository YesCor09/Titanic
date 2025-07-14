document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("formulario")
  const resultado = document.getElementById("resultado")
  const mensaje = document.getElementById("mensaje")
  const probabilidad = document.getElementById("probabilidad")

  formulario.addEventListener("submit", async (event) => {
    event.preventDefault()

    const formData = new FormData(formulario)
    const data = Object.fromEntries(formData.entries())

    // Mostrar mensaje de carga
    mensaje.textContent = "Procesando..."
    probabilidad.textContent = ""
    resultado.classList.remove("hidden")

    try {
      const response = await fetch("/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(data)
      })

      const result = await response.json()

      if (result.error) {
        mensaje.textContent = "Error: " + result.error
        mensaje.classList.remove("text-green-700")
        mensaje.classList.add("text-red-600")
        probabilidad.textContent = ""
      } else {
        mensaje.textContent = result.survived === 1
          ? "¡Sobrevivirías al Titanic!"
          : "No sobrevivirías al Titanic"
        mensaje.classList.remove("text-red-600")
        mensaje.classList.add("text-green-700")
        const porcentaje = result.probabilidad.toFixed(2)
        probabilidad.textContent = `Probabilidad de sobrevivir: ${porcentaje}%`

      }
    } catch (error) {
      mensaje.textContent = "Error en la solicitud"
      mensaje.classList.remove("text-green-700")
      mensaje.classList.add("text-red-600")
      probabilidad.textContent = ""
      console.error("Error:", error)
    }
  })
})
