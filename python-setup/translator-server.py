from flask import Flask, request, jsonify
from deep_translator import GoogleTranslator

app = Flask(__name__)

def translate(text):
    translated = GoogleTranslator("auto", "ru").translate(text)
    return translated

@app.route('/data', methods=['POST'])
def receive_data():
    data = request.json
    for article in data['articles']['eng']:
        orig_title = article['title']['original']
        article['title']['translated'] = translate(orig_title)
        orig_description = article['description']['original']
        article['description']['translated'] = translate(orig_description)
    return jsonify(data)

if __name__ == '__main__':
    app.run(port=5001)
