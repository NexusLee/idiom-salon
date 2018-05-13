interface IdiomItem {
    author?: string;
    value?: string;
}

class IdiomSalon implements IdiomItem{
    item: IdiomItem = {};
    lastWord: string;

    constructor() {
        LocalContractStorage.defineMapProperty(this, "repo", {});
    }

    init() {
        this.repo.put('records', []);
        this.repo.put('lastWord', null);
    }

    get() {
        let records = this.repo.get('records');
        let lastWord = this.repo.get('lastWord');
        let last = records[records.length-1];
        if( last === undefined ){
            this.lastWord = "";
        }else{
            let lastWordInChain  = last.value.substring(last.value.length - 1, last.value.length);
            this.lastWord = lastWordInChain;
        }

        let data = {
            records: records,
            lastWord: this.lastWord
        };

        return data;
    }

    save(value) {
        value = value.trim();
        if ( value === "" ) {
            throw new Error("empty key")
        }
        this.lastWord = value.substring(value.length - 1, value.length);

        if (value === ""){
            throw new Error("empty value");
        }
        let records = this.repo.get('records');
        let from = Blockchain.transaction.from;

        this.item.author = from;
        this.item.value = value;

        records.push(this.item);

        this.repo.put('records', records);
        this.repo.put('lastWord', this.lastWord);
    }
}

module.exports = IdiomSalon;