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
        'brasilia': 0,
        'sao paulo': 1,
        'rio de janeiro': 2,
        'belo horizonte': 3,
        'salvador': 4,
        'fortaleza': 5,
        'recife': 6,
        'porto alegre': 7,
        'curitiba': 8,
        'manaus': 9,
        # Agregar más ciudades según tu dataset
        'default': 0  # valor por defecto
    }
    return city_mapping.get(city_name.lower().strip(), city_mapping['default'])

def encode_date(date_string):
    """Convierte la fecha y hora a un valor numérico"""
    try:
        # Manejar formato datetime-local del HTML (YYYY-MM-DDTHH:MM)
        date_obj = datetime.strptime(date_string, '%Y-%m-%dT%H:%M')
        
        # Opción 1: Timestamp Unix (recomendado para fecha + hora)
        return int(date_obj.timestamp())
        
        # Opción 2: Día del año + hora como decimal
        # day_of_year = date_obj.timetuple().tm_yday
        # hour_fraction = date_obj.hour / 24.0
        # return day_of_year + hour_fraction
        
        # Opción 3: Solo la hora del día (0-23)
        # return date_obj.hour
        
    except ValueError:
        # Si falla, intentar solo con fecha
        try:
            date_obj = datetime.strptime(date_string, '%Y-%m-%d')
            return int(date_obj.timestamp())
        except ValueError:
            return 1  # valor por defecto

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
