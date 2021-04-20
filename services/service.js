import { get, set } from "../utils/localStorage.js"
import { defaultCategorys } from '../config/config.js'

/* Estructura de los datos y valores por defecto */
if(!get('data')) {
    const data = {
        categories: [],
        operations: []
    }

    defaultCategorys.map(el => data.categories.push({ name: el, id: uuidv4() }))

    set('data', data)
}


/* ===================== DATA CRUDE ===================== */

const crudder = key => property => {
    return ({
        create: (obj) => {
            const object = get(key)
            const newObject = {...obj, id: uuidv4()}
            
            return set('data', {...object, [property]: [...object[property], newObject]})
        },

        edit: (id, obj) => {
            const object = get(key)
            const newObject = {...obj, id}
            const newData = object[property].map((el) => el.id === id ? newObject : el)

            return set('data',  {...object, [property]: newData})
        },
        
        remove: (id) => {
            const object = get(key)
            const newData = object[property].filter((el) => el.id !== id)

            return set('data',  {...object, [property]: newData})
        },

        get: (id) => {
            const object = get(key)
            const item = object[property].find((el) => el.id === id)
            
            return item
        },

        getAll: () => get(key)[property]

    })
}

const base = crudder('data')
const operations = base('operations')
const categories = base('categories')

/* ===================== Filtros ===================== */


const filterByType = (array, type = 'all') => type === 'all' ? array : array.filter((el) => el.type === type)
    
const filterByCategory = (array, category = 'all') => category === 'all' ? array : array.filter((el) => el.category === category)

const ordenarByAmount = (array, order = 'asc') => {
    if(order === 'asc') {
        return array.sort((a, b) => a.amount - b.amount)
    } 
    else if(order === 'desc') {
        return array.sort((a, b) => b.amount - a.amount)
    }
}

const ordenarByDescription = (array, order = 'a-z') => {
    if(order === 'a-z') {
        return array.sort((a, b) => a.description < b.description ? -1 : 1)
    } 
    else if(order === 'z-a') {
        return array.sort((a, b) => a.description > b.description ? -1 : 1)
    }
}

export {
    operations,
    categories,
    filterByType,
    filterByCategory,
    ordenarByAmount,
    ordenarByDescription
}
