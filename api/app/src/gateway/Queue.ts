import { IChatRoom, IGameRoom, IUser } from '../types/types';

export class Queue  {
  storage: IUser[];
  head : number;
  tail : number;
  constructor() {
    this.storage = [];
    this.head = 0;
    this.tail = 0;
  }

  enqueue(element : IUser) {
    this.storage[this.tail] = element;
    this.tail++;
  }

  getHead() :number{
    return (this.head);
  }
  getTail() :number{
    return (this.tail);
  }

  dequeue() : IUser{
    let removed = this.storage[this.head];
    this.storage[this.head] = null;
    this.head++;
    return removed;
  }

  equal(element :IUser) : boolean {
    for (const ele of this.storage) {
      if (ele)
        if (ele.intra == element.intra)
          return true;
    }
      return false;
  }

  delete(clientId : string) : boolean {
    for (let i of this.storage) {
      if (i) {
        if (i.client.id == clientId)
          i = null;
      return true;
      }
    }
    return false;
  }
}
