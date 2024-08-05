from flask import Flask, request, jsonify
from deep_translator import GoogleTranslator

app = Flask(__name__)

def translate(text, fromLang, toLang):
    translated = GoogleTranslator(fromLang, toLang).translate(text)
    print(translated)
    return translated

@app.route('/data', methods=['POST'])
def receive_data():
    data = request.json
    print(data)
    article_lang = 'en'
    translateToLang = 'ru'
    
    try:
        if (data['trends'] == False):
            if data['lang'] == 'ru':
                article_lang = 'ru'
                translateToLang = 'en'

            orig_title = data['title']['original']
            data['title']['translated'] = translate(orig_title, article_lang, translateToLang)
            orig_description = data['description']['original']
            data['description']['translated'] = translate(orig_description, article_lang, translateToLang)
            orig_content = data['content']['original']
            data['content']['translated'] = translate(orig_content, article_lang, translateToLang)
        elif (data['trends'] == True):
            titles_len = len(data['objs'])
            for title in range(titles_len):
                print()
                orig_title = data['objs'][title][f'{title}']['original']
                data['objs'][title][f'{title}']['translated'] = translate(orig_title, article_lang, translateToLang)
            
        return jsonify(data)
    except Exception as e:
        print ("Error happened", e)

if __name__ == '__main__':
    app.run(port=5001)
