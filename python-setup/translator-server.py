from flask import Flask, request, jsonify
from deep_translator import GoogleTranslator

app = Flask(__name__)

def translate(text):
    translated = GoogleTranslator("auto", "ru").translate(text)
    return translated

@app.route('/data', methods=['POST'])
def receive_data():
    data = request.json
    if (data['trends'] == False):
        orig_title = data['title']['original']
        data['title']['translated'] = translate(orig_title)
        orig_description = data['description']['original']
        data['description']['translated'] = translate(orig_description)
        orig_content = data['content']['original']
        data['content']['translated'] = translate(orig_content)
    elif (data['trends'] == True):
        titles_len = len(data['objs'])
        for title in range(titles_len):
            print()
            orig_title = data['objs'][title][f'{title}']['original']
            data['objs'][title][f'{title}']['translated'] = translate(orig_title)
        
    return jsonify(data)

if __name__ == '__main__':
    app.run(port=5000)
