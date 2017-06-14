export default abstract class Setting {
    private _container: JQuery;

    protected _name: string;

    get el(): JQuery {
        return this._container.find(`[_data="${this._name}"]`);
    }

    constructor(container: JQuery) {
        this._container = container;
        this.init();
    }

    abstract init();
    abstract registerHandler();
}