type eventNameType = string
type callbackType = (data:string|null)=> void
interface options {
    project?: string,
    crosKey: string,
    identifier: '.',
    parseData: boolean
}
interface observer {
    [key:string]: callbackType[] 
}

class messsage {
    private options: options;
    private hasStorage: boolean = false;
    private observer: observer = {};
    private defaultObserver: callbackType[] = [];
    constructor(option:options){
        let options:options = {
            project: 'default',
            crosKey: '__cros_page_message',
            identifier: '.',
            parseData: true,
        }
        this.options = Object.assign(options, option)
        this.init()
    }
    nameSpace(event: eventNameType = ''){
        return this.options.crosKey + this.options.identifier + this.options.project+ this.options.identifier + event
    }
    private init(){
        if(this.verifyStoreage()){
            this.addEventListnerInit()
        }
    }
    private addEventListnerInit(){
        window.addEventListener('storage', (event: StorageEvent)=> {
            let key: string = event.key?.toString()||"";
            // 不是当前插件
            if(key.indexOf(this.options.crosKey) !== 0)return
            let keyList = key.split(this.options.identifier);
            // 不是当前项目
            if(keyList[1] !== this.options.project)return;
            // 复位key值
            if(event.newValue === null) return;
            let eventName = keyList[2] as eventNameType;
            if(typeof eventName !== 'string')return;
            var handleList:callbackType[] = [];
            if(eventName === ""){
                for(let key in this.observer){
                     handleList = handleList.concat(this.observer[key])
                }
            } else {
                handleList = this.observer[eventName]||[]
            }
            var data = event.newValue;
            if(this.options.parseData){
                data = this.parse(data)
            }
            handleList = handleList.concat(this.defaultObserver)
            this.triggerHandle(data, handleList)
        })
    }
    private triggerHandle(data: string|null, handleList:callbackType[]){
       return handleList.map((cb)=>{
            return cb(data)
        })
    }
    private verifyStoreage():boolean{
        try {
            localStorage.setItem('cros_test_pm', 'test');
            localStorage.removeItem('cros_test_pm');
        } catch (e) {
            console.error('此浏览器不支持 localStorage');
            this.hasStorage = false;
            return false
        }
        this.hasStorage = true;
        return true
    }
    on(cb:callbackType):void;
    on(eventName:string,cb:callbackType):void;
    on(eventName:string|callbackType, cb?:callbackType):boolean{
        if(typeof eventName === 'function'){
            cb = eventName;
            eventName = '';
        }
        if(typeof eventName !== 'string' || typeof cb !== 'function'){
            throw new Error('入参格式错误')
        }
        cb = cb as callbackType
        if(eventName === ''){
            this.defaultObserver.push(cb)
            return true
        }
        if(!this.observer.hasOwnProperty(eventName)){
            this.observer[eventName] = []
        }
        this.observer[eventName].push(cb);
        return true
    }
    off(eventName:string): boolean;
    off(cb:callbackType): boolean;
    off(eventName:string, cb:callbackType):boolean;
    off(eventName:string|callbackType, cb?:callbackType):boolean{
        let result = false;
        if(arguments.length === 1){
            switch(typeof eventName){
                case 'string':
                    if(this.observer[eventName]){
                        result = delete this.observer[eventName]
                    }
                    break;
                case 'function':
                    this.defaultObserver = this.defaultObserver.filter(item=>{
                        if(item === eventName){
                            result = true
                        }
                        return item !== eventName
                    })
                    break;
                default:
                    throw new Error('入参格式错误')
            }
            return result
        }
        if(typeof eventName !== 'string' || typeof cb !== 'function'){
            throw new Error('入参格式错误')
        }
        var observerList = this.observer[eventName];
        if(observerList){
            this.observer[eventName] = observerList.filter(item=>{
                if(item === cb){
                    result = true
                }
                return item !== cb
            })
        }
        return result
    }
    emit(data:any):void;
    emit(eventName:string, data:any):void;
    emit(eventName:string, data?:any): boolean|undefined{
        if(!this.hasStorage)return this.hasStorage;
        if(arguments.length === 1){
            data = eventName
            eventName = ''
        }
        if(typeof eventName !== 'string' || data === undefined){
            throw new Error('入参格式错误')
        }
        if(this.options.parseData){
            data = this.stringify(data)
        }
        localStorage.setItem(this.nameSpace(eventName), data);
        localStorage.removeItem(this.nameSpace(eventName));
    }
    private stringify(data:any):string{
        try{
           var d = JSON.stringify(data)
        }catch(e){
            console.error('消息序列化错误', data)
            throw new Error(e);
        }
        return d
    }
    private parse(data: string):any{
        try{
            var d = JSON.parse(data)
         }catch(e){
             console.error('消息格式化错误', data)
             throw new Error(e);
         }
         return d
    }

}
export default messsage

