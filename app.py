from flask import Flask, request, render_template, jsonify
import joblib
import pandas as pd
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)

# Cargar modelos y transformadores
modelo = joblib.load('modelo_titanic_1.pkl')              # Modelo entrenado
encoder = joblib.load('encoder.pkl_1')                    # ColumnTransformer que incluye OrdinalEncoder
scaler = joblib.load('scaler_final_1.pkl')                # StandardScaler
pca = joblib.load('pca_model_1.pkl')                      # PCA
columnas = joblib.load('columnas_modelo_1.pkl')           # Lista con el orden correcto de columnas

app.logger.debug('Modelos, scaler, encoder y PCA cargados correctamente.')

@app.route('/')
def home():
    return render_template('formulario.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Obtener datos del formulario
        Pclass = int(request.form['Pclass'])
        Sex = request.form['Sex']
        Age = float(request.form['Age'])
        SibSp = int(request.form['SibSp'])
        Embarked = request.form['Embarked']

        # Crear el DataFrame en el mismo orden que el entrenamiento
        input_df = pd.DataFrame([{
            'Pclass': Pclass,
            'Sex': Sex,
            'Age': Age,
            'SibSp': SibSp,
            'Embarked': Embarked
        }])

        # Asegurar orden correcto de columnas
        input_df = input_df[columnas]

        # Codificar con encoder que maneja variables categóricas
        input_encoded = encoder.transform(input_df)

        # Escalar
        X_scaled = scaler.transform(input_encoded)

        # Aplicar PCA
        X_pca = pca.transform(X_scaled)

        # Predecir
        prediction = modelo.predict(X_pca)
        probability = modelo.predict_proba(X_pca)[0][1]

        # Debug logs en consola
        print("Datos originales:\n", input_df)
        print("Codificado:\n", input_encoded)
        print("Escalado:\n", X_scaled)
        print("PCA:\n", X_pca)

        return jsonify({
            'survived': int(prediction[0]),
            'probabilidad': round(probability * 100, 2)  # Para mostrarlo como porcentaje
        })

    except Exception as e:
        app.logger.error(f'Error en la predicción: {str(e)}')
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
