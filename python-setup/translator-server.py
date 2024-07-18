from flask import Flask, request, jsonify
from deep_translator import GoogleTranslator

app = Flask(__name__)

def translate(text):
    translated = GoogleTranslator("auto", "ru").translate(text)
    return translated

@app.route('/data', methods=['POST'])
def receive_data():
    data = request.json

    orig_title = data['title']['original']
    data['title']['translated'] = translate(orig_title)
    orig_description = data['description']['original']
    data['description']['translated'] = translate(orig_description)
        
    return jsonify(data)

if __name__ == '__main__':
    app.run(port=5000)
