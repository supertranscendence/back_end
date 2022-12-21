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

  dequeue() {
    let removed = this.storage[this.head];
    delete this.storage[this.head];
    this.head++;
    return removed;
  }

  getSize() {
    return this.storage.length;
  }

  equal(element :IUser) : boolean {
    for (const ele of this.storage) {
      if (ele.intra = element.intra)
        return true;
    }
      return false;
  }
}
