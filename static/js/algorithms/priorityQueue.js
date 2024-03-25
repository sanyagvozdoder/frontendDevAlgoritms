class QueueItem 
{
	constructor(element, priority)
	{
		this.element = element;
		this.priority = priority;
	}
}

class PriorityQueue 
{
	constructor()
	{
		this.items = [];
	}

	_add(element, priority)
    {
        let elem = new QueueItem(element, priority);
        let added = false;

        for (let i = 0; i < this.items.length; i++)
        {
            if (this.items[i].priority > elem.priority)
            {
                this.items.splice(i, 0, elem);
                added = true;
                break;
            }
        }

        if (!added)
        {
            this.items.push(elem);
        }
    }

    enqueue(element, priority)
    {
        for(let el in this.items)
        {
            if(this.items[el].element === element)
            {
                this.items.splice(el, 1)
                break;
            }
        }

        this._add(element, priority)
    }
    
    dequeue = () => this.items.shift();

    isEmpty = () => this.items.length == 0;
}

export {PriorityQueue}