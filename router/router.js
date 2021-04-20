const handlerHashChange = () => {
    const { hash } = location

    const links = Array.from(document.querySelectorAll('a[href]'))

    links.map((el) => {
        const section = document.getElementById(el.attributes.href.value)
        
        if(el.attributes.href.value === hash) {
            el.classList.add('text-white')
            section?.classList.remove('hidden')
        } 
        else if(hash === '') {
            const firstElement = document.querySelector('section')
            const firstLink = Array.from(document.querySelectorAll(`a[href="${firstElement.id}"]`))

            firstLink ? firstLink?.classList?.add('text-white') : ''
            firstElement ? firstElement?.classList?.remove('hidden') : ''
        }        
        else {
            el.classList.remove('text-white')
            section?.classList.add('hidden')
        }
    }) 
}

window.addEventListener('DOMContentLoaded', handlerHashChange())

window.addEventListener('hashchange', handlerHashChange)