from flask import Flask, request, render_template, jsonify
import joblib
import pandas as pd
import logging
from datetime import datetime

app = Flask(__name__)

# Configurar el registro
logging.basicConfig(level=logging.DEBUG)

def encode_city(city_name):
    """Convierte el nombre de la ciudad a un valor numérico"""
    city_mapping = {
        'Brasilia': 0,
        'Cairo': 1,
        'Dubai': 2,
        'London': 3,
        'New York': 4,
        'Sydney': 5,
        'default': 0  # valor por defecto
    }
    return city_mapping.get(city_name.lower().strip(), city_mapping['default'])

def encode_date(date_string):
    """Convierte la fecha a un valor numérico (día del año)"""
    try:
        date_obj = datetime.strptime(date_string, '%Y-%m-%d')
        day_of_year = date_obj.timetuple().tm_yday
        return day_of_year
    except ValueError:
        return 1  # valor por defecto si hay error en la fecha

# Cargar el modelo entrenado
model = joblib.load('model.pkl')
app.logger.debug('Modelo cargado correctamente.')

@app.route('/')
def home():
    return render_template('formulario.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Obtener los datos enviados en el request
        PM25 = float(request.form['PM25'])
        PM10 = float(request.form['PM10'])
        SO2 = float(request.form['SO2'])
        O3 = float(request.form['O3'])
        Date = request.form['Date']
        City = request.form['City']

        # Convertir City y Date a valores numéricos
        city_encoded = encode_city(City)
        date_encoded = encode_date(Date)

        # Crear un DataFrame con los datos
        data_df = pd.DataFrame([[PM25, PM10, SO2, date_encoded, city_encoded, O3]], 
                              columns=['PM2.5', 'PM10', 'SO2', 'Date', 'City', 'O3'])
        
        app.logger.debug(f'DataFrame creado: {data_df}')
        app.logger.debug(f'Ciudad original: {City} -> Codificada: {city_encoded}')
        app.logger.debug(f'Fecha original: {Date} -> Codificada: {date_encoded}')

        # Realizar predicciones
        prediction = model.predict(data_df)
        app.logger.debug(f'Predicción: {prediction[0]}')

        # Devolver solo la predicción AQI
        return jsonify({
            'aqi_prediction': float(prediction[0])
        })
    except Exception as e:
        app.logger.error(f'Error en la predicción: {str(e)}')
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
