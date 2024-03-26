import numpy as np

file = open('static\\res\\weightsandbiases.txt','r')

def loss(predictions, targets):
    return -np.sum(np.log(predictions + 10**-100) * targets)

def sigmoid (x):
    return 1/(1 + np.exp(-x))

def sigmoid_derivative(x):
    return x * (1 - x)

class Layer:
    def __init__(self,inputSize,neuronsSize):
        self.weights = [[0.0] * neuronsSize for _ in range(inputSize)]
        self.biases = [[0.0] * neuronsSize for _ in range(1)]

        for i in range(inputSize):
            for j in range(neuronsSize):
                self.weights[i][j] = float(file.readline())

        for i in range(neuronsSize):
            self.biases[0][i] = float(file.readline())


    def forward(self,inputs):
        self.output = np.dot(inputs,self.weights) + self.biases

class NeuralNetwork:
    def __init__(self, inputSize, hiddenSize, outputSize):
        self.inputSize = inputSize
        self.hiddenSize = hiddenSize
        self.outputSize = outputSize
        self.learningRate = 0.001

        self.hiddenLayer = Layer(self.inputSize, self.hiddenSize)
        self.outputLayer = Layer(self.hiddenSize, self.outputSize)

    def forwardPropagation(self, inputs):
        self.hiddenLayer.forward(inputs)
        self.hiddenLayer.output = sigmoid(self.hiddenLayer.output)
        self.outputLayer.forward(self.hiddenLayer.output)
        self.outputLayer.output = sigmoid(self.outputLayer.output)

    def answer(self,inputs):
        self.forwardPropagation(inputs)

        index = 0
        maxi = 0.0

        for i in range(self.outputSize):
            if maxi<self.outputLayer.output[0][i]:
                maxi = self.outputLayer.output[0][i]
                index = i

        return index

nn = NeuralNetwork(784, 500, 10)
















