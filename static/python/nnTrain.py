import numpy as np
import cv2

filePath = "C:\\Users\\user\\Desktop\\testsfornn\\mnist_train.csv"
data = np.genfromtxt(filePath, delimiter=',')

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
        self.learningRate = 0.0001

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

nn = NeuralNetwork(2500, 1500, 10)

data = np.array(data)
rows,cols = data.shape
np.random.shuffle(data)

train_answers = data.T[0]
pxTrain = data.T[1:cols]

train_data = [[]*2500 for _ in range(60000)]

for i in range(pxTrain.shape[1]):
    temp_data = []
    temp_data.append(cv2.resize(pxTrain[:,i], (50, 50)))

    for j in range(50):
        for k in range(50):
            train_data[i].append(temp_data[0][j][k])


train_data = np.array(train_data).T

for i in range(60000):
    inputs = train_data[:,i]
    targetsCreate = lambda x: [1 if j == x else 0 for j in range(10)]
    targets = targetsCreate(train_answers[i])
    nn.train(inputs,targets,3)
    print("Try: ",i)


cnt = 0

train_answers = train_answers[0:1000]
train_data = train_data[:,0:1000]


for i in range(1000):
    inputs = train_data[:,i]
    answerNN = nn.answer(inputs)

    if(train_answers[i] == answerNN):
        cnt+=1
        print("Correct")
    else:
        print("Wrong")

    print("Correct: ", train_answers[i]," Answer: ", answerNN)

print("Accuracy: ", (cnt/(rows-5000)) * 100)

file = open("C:\\Users\\user\\Desktop\\weights\\wandb.txt","w")

file.write("Скрытый Слой\n")
file.write("Веса\n")

for i in range(nn.inputSize):
    for j in range(nn.hiddenSize):
        file.write(str(nn.hiddenLayer.weights[i][j]))
        file.write("\n")

file.write("Отступы\n")

for i in range(nn.hiddenSize):
    file.write(str(nn.hiddenLayer.biases[0][i]))
    file.write("\n")

file.write("Выходной Слой\n")
file.write("Веса\n")

for i in range(nn.hiddenSize):
    for j in range(nn.outputSize):
        file.write(str(nn.hiddenLayer.weights[i][j]))
        file.write("\n")

file.write("Отступы\n")

for i in range(nn.outputSize):
    file.write(str(nn.hiddenLayer.biases[0][i]))
    file.write("\n")











