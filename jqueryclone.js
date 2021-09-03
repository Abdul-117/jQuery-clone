class ElementCollector extends Array {
    ready(cb) {
        const isReady = this.some(e => {
            return e.readyState != null && e.readyState != 'loading'
        })
        if (isReady) {
            cb()
        } else {
            this.on('DOMContentLoaded',cb)
        }
        return this
    }
    on (event, cbSelector, cb) {
        if(typeof cbSelector === 'function') {
            this.forEach(e => e.addEventListener(event,cb))
        } else {
            this.forEach(elem => {
                elem.addEventListener(event, e => {
                    if(e.target.matches(cbSelector)) cb(e)
                })
            })
        }
        return this
    }
    next() {
        return this.map(e => e.nextElementSibling).filter(e => e != null)


    }
    prev() {
        return this.map(e => e.previousElementSibling).filter(e => e != null)
    }
    removeClass(className) {
        this.forEach(e => e.classList.remove(className))
        return this

    }
    addClass(className) {
        this.forEach(e => e.classList.add(className))
        return this
    }
    css(property, value) {
        const camelProp = property.replace('/(-[a-z])/',g => {
            return g.replace('-','').toUpperCase()
        })
        this.forEach(e => e.style[camelProp] = value)
        return this
    }


    
}

class AjaxPromise {
    constructor(promise) {
        this.promise = promise
    }
    done(cb) {
        this.promise = this.promise.then(data => {
            cb(data)
            return data
        })
        return this
    }

    fail(cb) {
        this.promise = this.promise.catch(cb)
        return this
    }

    always(cb) {
        this.promise = this.promise.finally(cb)
        return this
    }
}

function $(p) {
    /*check if p is a string and if true, implementing string selector
    return p as an array if false */
    if (typeof p == 'string' || p instanceof String) {
        return new ElementCollector(...document.querySelectorAll(p))
    } else {
        return new ElementCollector(p)
    }

}

$.get = function({url, data = {}, success = () => {}, dataType}) {
    const queryString = Object.entries(data).map(([key,value]) => {
        return `${key}=${value}`
    }).join('&')
    return new AjaxPromise (fetch(`${url}?${queryString}`, {
        method: 'GET',
        headers: {
            'Content-Type':dataType
        }
    }).then(res => {
        if(res.ok) {
            return res.json()
        } else {
            throw new Error(res.status)
        }
        
    }).then(data => {
        success(data)
        return data
    })
    )
}