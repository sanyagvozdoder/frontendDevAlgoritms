import numpy as np
import cv2
from scipy.ndimage import center_of_mass

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

def loss(predictions, targets):
    return -np.sum(np.log(predictions + 10**-100) * targets)

def sigmoid (x):
    return 1/(1 + np.exp(-x))

def sigmoid_derivative(x):
    return x * (1 - x)

class Layer:
    def __init__(self,inputSize,neuronsSize):
        self.weights = np.random.randn(inputSize,neuronsSize)*np.sqrt(2/inputSize)
        self.biases = np.random.randn(1,neuronsSize)
    def forward(self,inputs):
        self.output = np.dot(inputs,self.weights) + self.biases

class NeuralNetwork:
    def __init__(self, inputSize, hiddenSize, outputSize):
        self.inputSize = inputSize
        self.hiddenSize = hiddenSize
        self.outputSize = outputSize
        self.learningRate = 0.01

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

    def backPropagation(self, targets):
        output_error = targets-self.outputLayer.output
        output_delta = output_error * sigmoid_derivative(self.outputLayer.output)

        hidden_error = np.dot(self.outputLayer.weights,output_delta.T)
        hidden_delta = hidden_error.T * sigmoid_derivative(self.hiddenLayer.output)

        self.outputLayer.weights += self.learningRate * np.dot(output_delta.T,self.hiddenLayer.output).T
        self.outputLayer.biases += self.learningRate * np.sum(output_delta, axis=0, keepdims=True)
        self.hiddenLayer.weights += self.learningRate * np.dot(hidden_delta.T,inputs[:, np.newaxis].T).T
        self.hiddenLayer.biases += self.learningRate * np.sum(hidden_delta, axis=0, keepdims=True)

    def train(self, inputs, targets,epochs):
        for epoch in range(epochs):
            self.forwardPropagation(inputs)
            self.backPropagation(targets)
            print("Epoch: ",epoch," Loss: ", loss(self.outputLayer.output,targets))

nn = NeuralNetwork(2500, 1250, 10)

path = open("C:\\Users\\user\\Desktop\\testsfornn\\mnist_train.csv", )
data = np.genfromtxt(path, delimiter=',').T

train_data = data[1:].T
train_answers = data[0]

casted_train_data = []

for index in range(60000):
    pic = train_data[index]

    pic2d = np.array([[0.0] * 28 for _ in range(28)])

    for i in range(28):
        for j in range(28):
            pic2d[i][j] = pic[i * 28 + j]

    while np.sum(pic2d[0]) == 0:
        pic2d = pic2d[1:]
    while np.sum(pic2d[:, 0]) == 0:
        pic2d = np.delete(pic2d, 0, 1)
    while np.sum(pic2d[-1]) == 0:
        pic2d = pic2d[:-1]
    while np.sum(pic2d[:, -1]) == 0:
        pic2d = np.delete(pic2d, -1, 1)

    pic2d = cv2.resize(pic2d, (40, 40), interpolation=cv2.INTER_LINEAR) / 255.0

    picToSet = [[0.0] * 50 for _ in range(50)]

    for i in range(5, 45):
        for j in range(5, 45):
            picToSet[i][j] = pic2d[i - 5][j - 5]

    shiftx, shifty = getBestShift(np.array(picToSet))
    shifted = shift(np.array(picToSet), shiftx, shifty)
    picToSet = shifted

    pic1d = [0.0] * 2500

    for i in range(50):
        for j in range(50):
            pic1d[i * 50 + j] = picToSet[i][j]

    casted_train_data.append(pic1d)

casted_train_data = np.array(casted_train_data).T


for i in range(60000):
    inputs = casted_train_data[:,i]
    targetsCreate = lambda x: [1 if j == x else 0 for j in range(10)]
    targets = targetsCreate(train_answers[i])
    nn.train(inputs,targets,5)
    print("Try: ",i)

cnt = 0

for i in range(5000):
    inputs = casted_train_data[:,i]
    answerNN = nn.answer(inputs)

    if(train_answers[i] == answerNN):
        cnt+=1
        print("Correct")
    else:
        print("Wrong")

    print("Correct: ", train_answers[i]," Answer: ", answerNN)

print("Accuracy: ", (cnt/(5000)) * 100)





