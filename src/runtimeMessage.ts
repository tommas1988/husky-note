class RuntimeMessage {
    status: string = '';
    info: string = '';
    warning: string = '';
    error: string = '';

    setStatus(provider: () => string) {
        this.setMessage('status', provider);
    }

    setInfo(provider: () => string) {
        this.setMessage('info', provider);
    }

    setWarning(provider: () => string) {
        this.setMessage('warning', provider);
    }
    setError(provider: () => string) {
        this.setMessage('error', provider);
    }

    private setMessage(propName: 'status'|'info'|'warning'|'error' , provider: () => string) : void {
        setTimeout(() => {
            this[propName] = provider();
        }, 100);
    }
}

export default new RuntimeMessage();
