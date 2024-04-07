// https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function sleep(ms) 
{ 
    return new Promise(resolve => setTimeout(resolve, ms))
}

function displayTree(root) 
{
  if (root.decision) {
      return  ['<ul>',
                  '<li>',
                      '<button class="button" id="tree_', root.tag, '" >', root.decision, '</button>',
                  '</li>',
               '</ul>'].join('');
  }
  if(!root.predName)
  {
      return ['<ul>',
                  '<li>',
                      '<button class="button button-light">', 'Не знаю', '</button>',
                  '</li>',
              '</ul>'].join('');
  }
  
  return  ['<ul>',
              '<li>',
                  '<button class="button button-light" id="tree_', root.id, '" title="Инф. выигрыш: ', root.gain,'"><b>', root.attr, ' ', root.predName, ' ', root.pivot, ' ?</b></button>',
                  '<ul>',
                      '<li>',
                          '<button class="button button-green" id="tree_', root.id, '_yes" title="', root.matchedCount,' совпадений(-е)">Да</button>',
                          displayTree(root.match),
                      '</li>',
                      '<li>',
                          '<button class="button button-red" id="tree_', root.id, '_no" title="', root.notMatchedCount,' совпадений(-е)">Нет</button>',
                          displayTree(root.notMatch),
                      '</li>',
                  '</ul>',
              '</li>',
           '</ul>'].join('');
}

function parseCSV(data, delimiter=";")
{
    out = []

    for (let line of data.split('\n'))
    {
        let outLine = []

        for(let element of line.split(delimiter))
        {
            if(!isNaN(element))
                outLine.push(parseInt(element))
            else
                outLine.push(element)
        }

        out.push(outLine)
    }

    return out
}

function compare(a, b)
{
    if(typeof a != typeof b)
        throw Error('sln tree comparator type mismatch')

    if(typeof a == 'number')
        return a >= b

    return a == b;
}

let ENTROPY_THR = 0.01
let MAX_DEPTH = 70
let MIN_ITEMS_COUNT = 1

// https://habr.com/ru/companies/otus/articles/502200/
// https://github.com/lagodiuk/decision-tree-js/blob/master/decision-tree.js (as reference)
// https://neerc.ifmo.ru/wiki/index.php?title=%D0%94%D0%B5%D1%80%D0%B5%D0%B2%D0%BE_%D1%80%D0%B5%D1%88%D0%B5%D0%BD%D0%B8%D0%B9_%D0%B8_%D1%81%D0%BB%D1%83%D1%87%D0%B0%D0%B9%D0%BD%D1%8B%D0%B9_%D0%BB%D0%B5%D1%81

function countUniqueValues(data, attr)
{
    let amounts = {}

    for(let line of data)
    {
        amounts[line[attr]] = 0
    }

    for(let line of data)
    {
        amounts[line[attr]] += 1
    }

    return amounts
}

function split(data, attr, pivot)
{
    let yes = []
    let no = []

    for(let line of data)
    {
        let val = line[attr]

        if(compare(val, pivot))
            yes.push(line)
        else
            no.push(line)
    }

    return {
        match: yes,
        notMatch: no
    }
}

function mostFrequentValue(data, attr) 
{
    var amounts = countUniqueValues(data, attr)

    let cnt = 0
    let val = undefined

    for (const [value, count] of Object.entries(amounts)) 
    {
        if (count > cnt) 
        {
            cnt = count
            val = value
        }
    }

    return val;
}

function getEntropy(data, attr)
{
    if(data.length <= 0)
        return 0

    let amounts = countUniqueValues(data, attr)
    let entropy = 0
    for(let a in amounts)
    {
        let p = amounts[a] / data.length;
        entropy += -p * Math.log(p)
    }

    return entropy
}

function mkTree(trainData, decideAttr, ignoreAttrs, remainDepth = MAX_DEPTH, known = [], leaftag='r')
{
    let entropy = getEntropy(trainData, decideAttr)

    if(remainDepth <= 0 || entropy <= ENTROPY_THR)
    {
        console.log('не проходим по т.н. энтропии или глубине. пусть будет', mostFrequentValue(trainData, decideAttr))
        return { 
            decision: mostFrequentValue(trainData, decideAttr),
            tag: leaftag
        }
    }

    let used = []
    let bestSplit = { gain: 0 }

    for(let line of trainData)
    {
        for(const [attr, pivot] of Object.entries(line))
        {
            // не учитываем то что ищем и то что не должны учитывать
            if(attr == decideAttr || ignoreAttrs.includes(attr))
               continue 

            let predName = '=='
            if(typeof pivot == 'number')
                predName = '>='

            let attrPredPivot = attr + predName + pivot

            // не учитываем уже известные данные проверки
            if (used.includes(attrPredPivot) || known.includes(attrPredPivot)) 
              continue

            used.push(attrPredPivot)

            let splitRes = split(trainData, attr, pivot)

            // если т.н. разбиения не произошло то проверка бессмысленна/избыточна
            if(splitRes.match.length == 0 || splitRes.notMatch.length == 0)
                continue

            let mEntropy = getEntropy(splitRes.match, decideAttr)
            let nmEntropy = getEntropy(splitRes.notMatch, decideAttr)

            let splitEntropy = mEntropy * splitRes.match.length 
            splitEntropy += nmEntropy * splitRes.notMatch.length
            splitEntropy /= trainData.length

            let currentGain = entropy - splitEntropy

            if(currentGain > bestSplit.gain)
            {
                bestSplit = splitRes
                bestSplit.predName = predName
                bestSplit.predicate = attrPredPivot
                bestSplit.attr = attr
                bestSplit.pivot = pivot
                bestSplit.gain = currentGain
            }
        }
    }

    if (bestSplit.gain == 0) 
    {
        console.log('антивыигрыш, выходим. пусть будет', mostFrequentValue(trainData, decideAttr))
        return { 
            decision: mostFrequentValue(trainData, decideAttr),
            tag: leaftag
        }
    }

    known.push(bestSplit.predicate)

    let mSub = mkTree(bestSplit.match, decideAttr, ignoreAttrs, remainDepth - 1, known, leaftag + 't')
    let nmSub = mkTree(bestSplit.notMatch, decideAttr, ignoreAttrs, remainDepth - 1, known, leaftag + 'f')

    return {
        attr: bestSplit.attr,
        predName: bestSplit.predName,
        pivot: bestSplit.pivot,
        id: bestSplit.predicate,
        gain: bestSplit.gain,
        match: mSub,
        notMatch: nmSub,
        matchedCount: bestSplit.match.length,
        notMatchedCount: bestSplit.notMatch.length
    }
}

function getDecision(tree, knownInfo)
{
    let path = []

    let lastTree = undefined

    while(true) 
    {
        if (tree.decision)
            return [tree.decision, path.concat(tree)]

        path.push(tree)    

        if (compare(knownInfo[tree.attr], tree.pivot))
            tree = tree.match
        else
            tree = tree.notMatch
    }
}

function buildTrainingData()
{
    let cols = parseCSV(document.getElementById("tr_columns").value.trim())[0]
    let vals = parseCSV(document.getElementById("tr_data").value.trim())

    let data = []
    let lineI = 1

    for(let line of vals)
    {
        let lineData = {}

        if(cols.length != line.length)
        {
            alert(`Все строки значений по количеству должны совпадать со столбцами (линия ${lineI}, ожидалось: ${cols.length}, по факту ${line.length})`)
            break
        }

        for(let i in cols)
        {
            lineData[cols[i]] = line[i];
        }

        data.push(lineData)
        lineI++;
    }

    return data
}

let currTree = undefined

function buildTree()
{
    let data = buildTrainingData()
    let decideAttr = document.getElementById("cfg_column").value.trim()
    let ignoreAttrs = parseCSV(document.getElementById("cfg_ignore_columns").value.trim())[0]
    currTree = mkTree(data, decideAttr, ignoreAttrs)
    document.getElementById("decision-tree-parent").innerHTML = displayTree(currTree)
}

let dirty = []

async function decide()
{
    let cols = parseCSV(document.getElementById("tr_columns").value.trim())[0]
    let info = parseCSV(document.getElementById("decision_info").value.trim())[0]
    let knownInfo = {}

    while(dirty.length > 0)
    {
        dirty.pop().classList.remove('current')
    }

    if(cols.length != info.length)
    {
        alert(`Все значения колонок в поле для ввода известной информации должны соответствовать характеристикам, если информация не ясна, поставьте прочерк "-"`)
        return
    }

    for(let i in cols)
    {
        if(info[i] != '-')
            knownInfo[cols[i]] = info[i]
    }

    console.log('будем угадывать по следующим характеристикам', knownInfo)

    try
    {
        let decision = getDecision(currTree, knownInfo)

        let lastTree = undefined

        for(let node of decision[1])
        {
            await sleep(100)
            if(lastTree != undefined)
            {
                let suffix = (lastTree.match == node) ? "yes" : "no"
                let elem = document.getElementById('tree_' + lastTree.id + '_' + suffix)
                elem.classList.add('current')
                elem.scrollIntoView()
                dirty.push(elem)
            }

            await sleep(150)
            let id = node.id || node.tag
            let elem = document.getElementById('tree_' + id)
            elem.classList.add('current')
            elem.scrollIntoView()
            dirty.push(elem)

            lastTree = node;
        }
    }
    catch
    {
        alert('К сожалению, по известным данным не удалось найти решение. Попробуйте построить дерево с игнорированием других характеристик.')
    }

    //document.getElementById("decision").innerHTML = decision[0]
}

let trData = `Homer;0;250;36;male
Marge;10;150;34;female
Bart;2;90;10;male
Lisa;6;78;8;female
Maggie;4;20;1;female
Abe;1;170;70;male
Selma;8;160;41;female
Otto;10;180;38;male
Krusty;6;200;45;male`


document.getElementById("tr_columns").value = "person;hairLength;weight;age;sex"
document.getElementById("tr_data").value = trData
document.getElementById("cfg_column").value = "sex"
document.getElementById("cfg_ignore_columns").value = "person;hairLength"

document.getElementById("generate").addEventListener("click", buildTree)
document.getElementById("decide").addEventListener("click", decide)
buildTree()