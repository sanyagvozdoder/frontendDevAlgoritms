import numpy as np
import json

file = open('static\\res\\weightsandbiases.txt','r')

flag = False
pic = []

def get_data(data):
    global pic
    global flag
    
    temp_data = []

    for i in range(0,10000,4):
        r = float(data[str(i)])
        g = float(data[str(i+1)])
        b = float(data[str(i+2)])

        color = (255 - (0.299 * r + 0.587 * g + 0.114 * b))/255.0

        temp_data.append(color)
        

    pic = temp_data
    pic = np.array(pic).T
    flag = True


def sigmoid (x):
    return 1/(1 + np.exp(-x))


class Layer:
    def __init__(self,inputSize,neuronsSize):
        self.weights = [[0.0] * neuronsSize for _ in range(inputSize)]
        self.biases = [[0.0] * neuronsSize for _ in range(1)]

        for i in range(inputSize):
            for j in range(neuronsSize):
                f = file.readline()

                if(f == ''):
                    continue

                self.weights[i][j] = float(f)

        for i in range(neuronsSize):
            f = file.readline()

            if(f == ''):
                continue

            self.biases[0][i] = float(f)

        self.weights = np.array(self.weights)
        self.biases = np.array(self.biases)

    def forward(self,inputs):
        self.output = np.dot(inputs,self.weights) + self.biases

class NeuralNetwork:
    def __init__(self, inputSize, hiddenSize, outputSize):
        self.inputSize = inputSize
        self.hiddenSize = hiddenSize
        self.outputSize = outputSize

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

nn = NeuralNetwork(2500, 1250, 10)


def get_answer():
    global pic

    while not flag:
        pass
    
    return str(nn.answer(pic))

    pic = []














