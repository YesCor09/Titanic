document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formulario');
    const submitBtn = document.getElementById('submitBtn');
    const buttonText = document.getElementById('buttonText');
    const leafIcon = document.getElementById('leafIcon');
    const loadingState = document.getElementById('loadingState');
    const resultState = document.getElementById('resultState');
    const successResult = document.getElementById('successResult');
    const errorResult = document.getElementById('errorResult');
    const plantEmoji = document.getElementById('plantEmoji');
    const plantType = document.getElementById('plantType');
    const errorMessage = document.getElementById('errorMessage');
    const progressBar = document.getElementById('progressBar');

    formulario.addEventListener('submit', clasificarIris);

    function getPlantEmoji(categoria) {
        switch (categoria?.toLowerCase()) {
            case 'iris-setosa':
                return '🌸';
            case 'iris-versicolor':
                return '🌺';
            case 'iris-virginica':
                return '🌻';
            default:
                return '🌿';
        }
    }

    function showLoading() {
        // Hide result
        resultState.classList.add('hidden');
        successResult.classList.add('hidden');
        errorResult.classList.add('hidden');
        
        // Show loading
        loadingState.classList.remove('hidden');
        loadingState.classList.add('flex');
        
        // Update button
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
        buttonText.textContent = 'Clasificando...';
        leafIcon.innerHTML = `
            <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
        `;
    }

    function showResult(data) {
        // Hide loading
        loadingState.classList.add('hidden');
        loadingState.classList.remove('flex');
        
        // Show result with animation
        resultState.classList.remove('hidden');
        resultState.classList.add('animate-slide-in');
        
        if (data.error) {
            errorResult.classList.remove('hidden');
            errorResult.classList.add('flex');
            errorMessage.textContent = 'Error: ' + data.error;
        } else {
            successResult.classList.remove('hidden');
            successResult.classList.add('flex');
            plantEmoji.textContent = getPlantEmoji(data.categoria);
            plantType.textContent = data.categoria;
            
            // Animate progress bar
            setTimeout(() => {
                progressBar.classList.add('complete');
            }, 500);
        }
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        buttonText.textContent = 'Clasificar Planta';
        leafIcon.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l14 9-14 9V3z"></path>
            </svg>
        `;
    }

    function clasificarIris(event) {
        event.preventDefault();
        
        // Reset progress bar
        progressBar.classList.remove('complete');
        
        const SepalLengthCm = document.getElementById('SepalLengthCm').value;
        const SepalWidthCm = document.getElementById('SepalWidthCm').value;
        const PetalLengthCm = document.getElementById('PetalLengthCm').value;
        const PetalWidthCm = document.getElementById('PetalWidthCm').value;

        showLoading();

        fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `SepalLengthCm=${SepalLengthCm}&SepalWidthCm=${SepalWidthCm}&PetalLengthCm=${PetalLengthCm}&PetalWidthCm=${PetalWidthCm}`,
        })
        .then(response => response.json())
        .then(data => {
            // Simulate processing time for better UX
            setTimeout(() => {
                showResult(data);
            }, 1500);
        })
        .catch(error => {
            setTimeout(() => {
                showResult({ error: 'Error en la solicitud' });
            }, 1500);
            console.error('Error:', error);
        });
    }
});