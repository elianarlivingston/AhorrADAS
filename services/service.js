import { get, set } from "../utils/localStorage.js"
import { defaultCategorys } from '../config/config.js'
import { format } from '../utils/utils.js'

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


const filterByType = (array, type = 'all') => type === 'all' ? array : array?.filter((el) => el?.type === type)
    
const filterByCategory = (array, category = 'all') => category === 'all' ? array : array?.filter((el) => el?.category === category)
    
const filterByDate = (array, date) => array?.filter((el) => (new Date(el.date).getTime() >= new Date(date).getTime()))

const ordenarByAmount = (array, order = 'asc') => {
    if(order === 'asc') {
        return array?.sort((a, b) => a?.amount - b?.amount)
    } 
    else if(order === 'desc') {
        return array?.sort((a, b) => b?.amount - a?.amount)
    }
}

const ordenarByDate = (array, order) => {
    if(order === 'asc') {
        return array?.sort((a, b) => {
            const A = new Date(a?.date).getTime() 
            const B = new Date(b?.date).getTime()

            return parseInt(A) - parseInt(B)
        })
    } 

    return array?.sort((a, b) => {
        const A = new Date(a?.date).getTime() 
        const B = new Date(b?.date).getTime()

        return parseInt(B) - parseInt(A)
    })
}

const ordenarByDescription = (array, order = 'a-z') => {
    if(order === 'a-z') {
        return array?.sort((a, b) => a?.description < b?.description ? -1 : 1)
    } 
    else if(order === 'z-a') {
        return array?.sort((a, b) => a?.description > b?.description ? -1 : 1)
    }
}

const orderBy = (array, order) => {
    switch (order) {
        case 'date-asc':
            return ordenarByDate([...array], 'asc') ? ordenarByDate([...array], 'asc') : []
        case 'date-desc':
            return ordenarByDate([...array]) ? ordenarByDate([...array]) : []
        case 'amount-asc':
            return ordenarByAmount(array, 'asc') ? ordenarByAmount(array, 'asc') : []
        case 'amount-desc':
            return ordenarByAmount(array, 'desc') ? ordenarByAmount(array, 'desc') : []
        case 'asc':
            return ordenarByDescription(array, 'a-z') ? ordenarByDescription(array, 'a-z') : []
        case 'desc':
            return ordenarByDescription(array, 'z-a') ? ordenarByDescription(array, 'z-a') : []
        default:
            return array
    }       
}

  const obtenerTotalesPorMes = (operaciones) => {
    return operaciones.reduce((totales, operacion) => {
      const fecha = new Date(operacion.fecha)
      const fechaFormateada = `${fecha.getMonth() + 1}/${fecha.getFullYear()}`
  
      if (!totales[fechaFormateada]) {
        totales[fechaFormateada] = {
          ganancia: 0,
          gasto: 0,
          balance: 0,
        }
      }
  
      totales[fechaFormateada][operacion.tipo.toLowerCase()] += operacion.monto
  
      if (operacion.tipo === OPERACIONES.GANANCIA) {
        totales[fechaFormateada].balance += operacion.monto
      } else {
        totales[fechaFormateada].balance -= operacion.monto
      }
  
      return totales
    }, {})
  }
  
const highSpendingCategory = (operations) => {
    if(!operations || !Array.isArray(operations)) return []

    return operations.reduce((total, operation) => {
        const categoryName = categories.get(operation.category)?.name

        if(!total.hasOwnProperty(categoryName)) {
            total[categoryName] = {
                spending: 0,
                profits: 0,
                balance: 0
            }
        }

        total[categoryName][operation.type] += parseInt(operation.amount)

        if(operation.type === 'profits') {
            total[categoryName].balance += parseInt(operation.amount)
        } 
        else {
            total[categoryName].balance -= parseInt(operation.amount)
        } 

        return total
    }, {})
}

const resumenByMonth = (operations) => {
    if(!operations || !Array.isArray(operations)) return []

    return operations.reduce((total, operation) => {
        const date = format(operation.date, 'MM/YYYY')

        if(!total.hasOwnProperty(date)) {
            total[date] = {
                spending: 0,
                profits: 0,
                balance: 0
            }
        }

        total[date][operation.type] += parseInt(operation.amount)

        if (operation.type === 'profits') {
            total[date].balance += parseInt(operation.amount)
          } else {
            total[date].balance -= parseInt(operation.amount)
          }

        return total
    }, {})
}

const resumen = (operations) => {
    const list = Object.entries(highSpendingCategory(operations)) 
    const listProfits = list.map(el => el[1].profits)
    const listSpending = list.map(el => el[1].spending)
    const listBalance = list.map(el => el[1].balance)

    const maxProfits = Math.max(...listProfits)
    const maxSpending = Math.max(...listSpending)
    const maxBalance = Math.max(...listBalance)

    const categoryMaxProfits =  list.find(el => el[1].profits === maxProfits)
    const categoryMaxSpending =  list.find(el => el[1].spending === maxSpending)
    const categoryMaxBalance =  list.find(el => el[1].balance === maxBalance)

    const listMonth = Object.entries(resumenByMonth(operations))
    const listMonthProfits = listMonth.map(el => el[1].profits)
    const listMonthSpending = listMonth.map(el => el[1].spending)

    const maxMonthProfits = Math.max(...listMonthProfits)
    const maxMonthSpending = Math.max(...listMonthSpending)

    const monthMaxProfits =  listMonth.find(el => el[1].profits === maxMonthProfits)
    const monthMaxSpending =  listMonth.find(el => el[1].spending === maxMonthSpending)

    return {
        categoryMaxProfits: categoryMaxProfits,
        categoryMaxSpending: categoryMaxSpending,
        categoryBalance: categoryMaxBalance,
        monthMaxProfits,
        monthMaxSpending
    }
}

export {
    operations,
    categories,
    filterByCategory,
    filterByDate,
    filterByType,
    orderBy,
    ordenarByDate,
    ordenarByAmount,
    resumen,
    highSpendingCategory,
    resumenByMonth
}
