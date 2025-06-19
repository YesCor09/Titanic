document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formulario');
    formulario.addEventListener('submit', clasificarIris);

    function clasificarIris(event) {
        event.preventDefault();
        const SepalLengthCm = document.getElementById('SepalLengthCm').value;
        const SepalWidthCm = document.getElementById('SepalWidthCm').value;
        const PetalLengthCm = document.getElementById('PetalLengthCm').value;
        const PetalWidthCm = document.getElementById('PetalWidthCm').value;

        fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `SepalLengthCm=${SepalLengthCm}&SepalWidthCm=${SepalWidthCm}&PetalLengthCm=${PetalLengthCm}&PetalWidthCm=${PetalWidthCm}`,
        })
        .then(response => response.json())
        .then(data => {
            const resultado = document.getElementById('resultado');
            if (data.error) {
                resultado.innerText = 'Error: ' + data.error;
                resultado.className = 'text-red-600 font-semibold mt-4';
            } else {
                resultado.innerText = 'La planta es ' + data.categoria;
                resultado.className = 'text-green-600 font-semibold mt-4';
            }
        })
        .catch(error => {
            document.getElementById('resultado').innerText = 'Error en la solicitud.';
            console.error('Error:', error);
        });
    }
});
