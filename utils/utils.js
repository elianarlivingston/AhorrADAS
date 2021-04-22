export const $ = (selector) => document.querySelector(selector)

export const $$ = (selector) => document.querySelectorAll(selector)

export const format = (date, format) => {
    const f = format.toUpperCase()

    switch (f) {
        case 'YYYY/MM/DD':
            return new Date(date).toISOString().split('T')[0]
        case 'DD/MM/YYYY':
            return new Date(date).toLocaleDateString('es-AR')
        case 'MM/YYYY':
            return `${new Date(date).getMonth() + 1}/${new Date(date).getFullYear()}`
        default:
            return new Date(date).toLocaleDateString('es-AR')
    }
}

export const push = (path) => window.location.assign(path) 