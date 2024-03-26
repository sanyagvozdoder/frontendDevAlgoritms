import numpy as np


filePath = "C:\\Users\\user\\Desktop\\testsfornn\\mnist_train.csv"
data = np.genfromtxt(filePath, delimiter=',')

data = np.array(data)
rows,cols = data.shape

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

nn = NeuralNetwork(784, 500, 10)


for j in range(7):

    np.random.shuffle(data)

    dataTrain = data[0:5000].T
    outTrain = dataTrain[0]
    pxTrain = dataTrain[1:cols]

    for i in range(5000):
        inputs = pxTrain[:,i]
        targetsCreate = lambda x: [1 if j == x else 0 for j in range(10)]
        targets = targetsCreate(outTrain[i])
        nn.train(inputs,targets,10)
        print("Try: ",i)


cnt = 0

np.random.shuffle(data)

dataDev = data[5000:rows].T
outDev = dataDev[0]
pxDev = dataDev[1:cols]

for i in range(rows-5000):
    inputs = pxDev[:, i]
    answerNN = nn.answer(inputs)

    if(outDev[i] == answerNN):
        cnt+=1
        print("Correct")
    else:
        print("Wrong")

    print("Correct: ", outDev[i]," Answer: ", answerNN)

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











