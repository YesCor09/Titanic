document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("formulario")
  const submitBtn = document.getElementById("submitBtn")
  const buttonText = document.getElementById("buttonText")
  const airIcon = document.getElementById("airIcon")
  const loadingState = document.getElementById("loadingState")
  const resultState = document.getElementById("resultState")
  const successResult = document.getElementById("successResult")
  const errorResult = document.getElementById("errorResult")
  const aqiValue = document.getElementById("aqiValue")
  const errorMessage = document.getElementById("errorMessage")
  const progressBar = document.getElementById("progressBar")

  // Set today's date and current time as default
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  const currentDateTime = `${year}-${month}-${day}T${hours}:${minutes}`
  document.getElementById("Date").value = currentDateTime

  formulario.addEventListener("submit", analizarCalidadAire)

  function showLoading() {
    // Hide result
    resultState.classList.add("hidden")
    successResult.classList.add("hidden")
    errorResult.classList.add("hidden")

    // Show loading
    loadingState.classList.remove("hidden")
    loadingState.classList.add("flex")

    // Update button
    submitBtn.disabled = true
    submitBtn.classList.add("opacity-75", "cursor-not-allowed")
    buttonText.textContent = "Analizando..."
    airIcon.innerHTML = `
            <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
        `
  }

  function showResult(data) {
    // Hide loading
    loadingState.classList.add("hidden")
    loadingState.classList.remove("flex")

    // Show result with animation
    resultState.classList.remove("hidden")
    resultState.classList.add("animate-slide-in")

    if (data.error) {
      errorResult.classList.remove("hidden")
      errorResult.classList.add("flex")
      errorMessage.textContent = "Error: " + data.error
    } else {
      successResult.classList.remove("hidden")
      successResult.classList.add("flex")
      aqiValue.textContent = data.aqi_prediction.toFixed(2)

      // Animate progress bar
      setTimeout(() => {
        progressBar.classList.add("complete")
      }, 500)
    }

    // Reset button
    submitBtn.disabled = false
    submitBtn.classList.remove("opacity-75", "cursor-not-allowed")
    buttonText.textContent = "Analizar Calidad del Aire"
    airIcon.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
        `
  }

  function analizarCalidadAire(event) {
    event.preventDefault()

    // Reset progress bar
    progressBar.classList.remove("complete")

    const PM25 = document.getElementById("PM25").value
    const PM10 = document.getElementById("PM10").value
    const SO2 = document.getElementById("SO2").value
    const O3 = document.getElementById("O3").value
    const Date = document.getElementById("Date").value
    const City = document.getElementById("City").value

    showLoading()

    fetch("/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `PM25=${PM25}&PM10=${PM10}&SO2=${SO2}&O3=${O3}&Date=${Date}&City=${City}`,
    })
      .then((response) => response.json())
      .then((data) => {
        // Simulate processing time for better UX
        setTimeout(() => {
          showResult(data)
        }, 1500)
      })
      .catch((error) => {
        setTimeout(() => {
          showResult({ error: "Error en la solicitud" })
        }, 1500)
        console.error("Error:", error)
      })
  }
})
