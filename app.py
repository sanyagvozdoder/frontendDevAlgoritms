from flask import Flask, render_template

app = Flask(__name__)

algorithms_templates = {
    'astar': 'pages/astar.html',
    'nn':'pages/neural_network.html',
    'clusterization': 'pages/clusterization.html'
}

@app.route('/')
def index():
    return render_template('pages/home.html')

@app.route('/watch/<name>')
def algorithm_details(name):
    if name not in algorithms_templates:
        return render_template('pages/unknown_algorithm.html')

    return render_template(algorithms_templates[name])
