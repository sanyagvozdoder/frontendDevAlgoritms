import numpy as np
import json
import cv2
from scipy.ndimage import center_of_mass
from decimal import Decimal

file = open('static\\res\\weightsandbiases.txt','r')

pic = []

def shift(img,sx,sy):
    rows,cols = img.shape
    M = np.float32([[1,0,sx],[0,1,sy]])
    shifted = cv2.warpAffine(img,M,(cols,rows))
    return shifted

def getBestShift(img):
    cx, cy = center_of_mass(img)

    rows,cols = img.shape
    shiftx = np.round(cols/2.0-cx).astype(int)
    shifty = np.round(rows/2.0-cy).astype(int)

    return shiftx,shifty

async def get_data(data):
    global pic
    
    temp_data = []

    for i in range(0,1000000,4):
        r = float(data[str(i)])
        g = float(data[str(i+1)])
        b = float(data[str(i+2)])

        color = (255 - (0.299 * r + 0.587 * g + 0.114 * b))
        temp_data.append(color)
        

    pic2d = np.array([[0.0] * 500 for _ in range(500)])

    for i in range(500):
        for j in range(500):
            pic2d[i][j] = temp_data[i * 500 + j]

    while np.sum(pic2d[0]) == 0:
        pic2d = pic2d[1:]
    while np.sum(pic2d[:, 0]) == 0:
        pic2d = np.delete(pic2d, 0, 1)
    while np.sum(pic2d[-1]) == 0:
        pic2d = pic2d[:-1]
    while np.sum(pic2d[:, -1]) == 0:
        pic2d = np.delete(pic2d, -1, 1)

    pic2d = cv2.resize(pic2d, (36, 36), interpolation=cv2.INTER_AREA) / 255.0

    picToSet = [[0.0] * 50 for _ in range(50)]

    for i in range(7, 43):
        for j in range(7, 43):
            picToSet[i][j] = pic2d[i - 7][j - 7]


    shiftx, shifty = getBestShift(np.array(picToSet))
    shifted = shift(np.array(picToSet), shiftx, shifty)
    picToSet = shifted

    pic1d = [0.0] * 2500

    for i in range(50):
        for j in range(50):
            pic1d[i * 50 + j] = picToSet[i][j]

    pic = pic1d
    pic = np.array(pic).T

    return True


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

        indexes = [0,0,0]
        maxis = [0,0,0]

        for i in range(self.outputSize):
            if maxis[0]<float(format(self.outputLayer.output[0][i]*100, '.2f')):
                maxis[0] = float(format(self.outputLayer.output[0][i]*100, '.2f'))
                indexes[0] = i
            elif maxis[1]<float(format(self.outputLayer.output[0][i]*100, '.2f')):
                maxis[1] = float(format(self.outputLayer.output[0][i]*100, '.2f'))
                indexes[1] = i
            elif maxis[2]<float(format(self.outputLayer.output[0][i]*100, '.2f')):
                maxis[2] = float(format(self.outputLayer.output[0][i]*100, '.2f'))
                indexes[2] = i

        ans = {
            "digits":indexes,
            "percent":maxis
        }

        return ans

nn = NeuralNetwork(2500, 1250, 10)


def get_answer():
    global pic
    
    return nn.answer(pic)

    pic = []














