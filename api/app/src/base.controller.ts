export class BaseController<T> {
    constructor() {}

    keyAssignedData(data: T, accessToken: string){
        return Object.assign(data , {accessToken: accessToken});
    }
}