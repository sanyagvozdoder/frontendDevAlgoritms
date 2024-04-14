from flask import Flask, render_template, request, session,jsonify
from static.python.nnmodel import get_answer, get_data

app = Flask(__name__)
app.secret_key = "super secret key"

algorithms_templates = {
    'astar': 'pages/astar.html',
    'nn':'pages/neural_network.html',
    'clusterization': 'pages/clusterization.html',
    'slntree': 'pages/slntree.html',
    'antcolony': 'pages/antcolony.html',
    'genetic' : 'pages/gen.html'
}

@app.route('/')
def index():
    return render_template('pages/home.html')

@app.route('/watch/<name>')
def algorithm_details(name):
    if name not in algorithms_templates:
        return render_template('pages/unknown_algorithm.html')

    return render_template(algorithms_templates[name])

@app.route('/data_from_canvas', methods=['POST'])
async def receive():
    session['data'] = request.get_json()
    resp = await get_data(session['data']) 
    return resp
    

@app.route('/data_to_js', methods = ['GET'])
def send():
    session['answer'] = get_answer()
    return jsonify(session['answer'])

if __name__ == '__main__':
    app.debug = True
    app.run()

        
        
