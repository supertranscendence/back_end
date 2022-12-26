import { IChatRoom, IGameRoom, IUser } from '../types/types';

export class Queue  {
  storage: IUser[];
  head : number;
  tail : number;
  size : number;
  constructor() {
    this.storage = [];
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }

  data() {
    console.log('----------- data ------------')
    console.log(this.storage)
    console.log(this.head)
    console.log(this.tail) // 안이 증가하면 tail이 뒤로
    console.log(this.size) // 안의 내용물의 갯수
  }

  enqueue(element : IUser) {
    this.storage[this.tail] = element;
    this.tail++;
    this.size++;
  }

  getSize() :number {
    return (this.size);
  }

  getHead() :number{
    return (this.head);
  }
  getTail() :number{
    return (this.tail);
  }

  dequeue() : IUser{
    
    let removed;
    for (removed of this.storage)
    {
      removed = this.storage[this.head];
      if (removed == null)
        this.head++;
      else
        break;
    }
    this.storage[this.head] = null;
    this.head++;
    this.size--;
    return removed;
  }

  equal(element :IUser) : boolean {
    for (const ele of this.storage) {
      if (ele)
        if (ele.intra == element.intra)
        {
          console.log('equal: ' , ele.intra);
          return true;
        }
    }
      return false;
  }

  //지우기가 안됨
  delete(clientId : string) : boolean {
    
    for(var i = 0; i < this.tail; i++){ 
      if (this.storage[i] != null) 
        if (this.storage[i].client.id === clientId) { 
        this.storage[i] = null;
        console.log('true');
        this.size--;
        return true;
      }
    }
    console.log('false');
    return false;

    // for (let i of this.storage) {
    //   if (i) {
    //     console.log(i)
    //     if (i.client.id == clientId)
    //     {  
    //       i = null; // 여기서 지우는 방식을 달리하면 될거 같음!
    //       console.log(i)
    //     }
    //     console.log('ture');
    //     return true;
    //   }
    // }
    // console.log('false');
    // return false;
  }
}
