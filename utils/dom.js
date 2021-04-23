import {
    operations,
    categories,
    filterByCategory,
    filterByDate,
    filterByType,
    orderBy,
    highSpendingCategory,
    resumenByMonth,
    resumen

} from '../services/service.js'
import { $, $$, format, push } from './utils.js'

/* ==================================== Sidebar ==================================== */

const sidebar = $('#sidebar')
const menuOpen = $('#menu-open')
const menuClose = $('#menu-close')
const listSidebar = $('#list-sidebar')

const openSidebar = () => sidebar.classList.replace('-left-full', 'left-0')
const closeSidebar = () => sidebar.classList.replace('left-0', '-left-full')

menuOpen.addEventListener('click', openSidebar)
menuClose.addEventListener('click', closeSidebar)
listSidebar.addEventListener('click', closeSidebar)

/* ==================================== Modal ==================================== */

const modal = $('#modal')
const elements = Array.from($$('[data-toggle="modal"]'))


// reset form 
const resetForm = () => {
    const form = $('#form-new-operation')
    form['category'].value = 'all'
    form['description'].value = ''
    form['date'].value = format(new Date(), 'YYYY/MM/DD')
    form['amount'].value = '0'
    form['type'].value = 'spending'
}

const toggleModal = () => {
    modal.classList.toggle('hidden')
    resetForm()
}

elements.map((el) => el.addEventListener('click', toggleModal))


/* ==================================== Validation input ==================================== */

const inputs = Array.from($$('input[required]'))

inputs?.map((el) => el.addEventListener('input', event => {
    const messageError = event.target.nextElementSibling

    if(!event.target.checkValidity()) {
        messageError.innerHTML = event.target.validationMessage
        return
    }

    messageError.innerHTML = ''
}))


/* ==================================== Fill selects ==================================== */

const selectsCategories = Array.from($$('[data-list="category"]'))

const fillCategories = () => {
    selectsCategories?.map((element) => {
        const options = categories.getAll()
        ?.reduce((acc, category) => acc + `
            <option value="${category.id}">${category.name}</option>
        `, '')
    
        if(element.id === 'filter-by-category') {
            element.innerHTML = `<option value="all" selected>Todas</option> ${options} `
            return
        }
    
        element ? element.innerHTML = options : ''
    })
}

fillCategories()
/* ==================================== Fill input date ==================================== */

const inputsDate = Array.from($$('input[type="date"]'))

inputsDate?.map(el => el.value = format(new Date(), 'YYYY/MM/DD'))

/* ==================================== CATEGORIES ==================================== */

const listCategories = $('#list-categories')
const formCreateCategory = $('#form-create-category')
const formEditCategory = $('#form-edit-category')

// Edit
const editCategory = (name, id) => {
    $('#rename').value = name
    $('#rename').setAttribute('data-id', id)
    push('#/categorias/editar')
}

// Delete
const deleteCategory = (id) => {
    categories.remove(id)
    
    const operationsDelete = filterByCategory(operations.getAll(), id)
    operationsDelete.map(el => operations.remove(el.id))

    updatedCategories(listCategories)
    updatedOperations(listOperations, operations.getAll())
}

// Form create
formCreateCategory.addEventListener('submit', (event) => {
    event.preventDefault()

    categories.create({ name: event.target['name'].value })

    updatedCategories(listCategories)

    event.target['name'].value = ''

    fillCategories()
})

// Form Edit
formEditCategory.addEventListener('submit', (event) => {
    event.preventDefault()

    const id = event.target['rename'].getAttribute('data-id')

    categories.edit( id, { name: event.target['rename'].value })

    updatedCategories(listCategories)

    updatedOperations(listOperations, operations.getAll())

    fillCategories()
    
    push('#/categorias')
})

// Render and update
const updatedCategories = (element) => {
    if(!element) return

    element.innerHTML = ''

    for (const category of categories.getAll()?.reverse()) {
        const li = document.createElement('li')

        li.setAttribute('class', 'flex justify-between items-center gap-4')
        li.setAttribute('id', category.id)

        li.insertAdjacentHTML('beforeend',
            `<label class="p-2 rounded bg-indigo-100 text-indigo-600">${category.name}</label>
            <div class="flex gap-4 text-blue-400 cursor-pointer justify-center">
                <button data-edit="category">Editar</button>
                <button data-delete="category">Eliminar</button>
            </div>`
        )

        const edit = li.querySelector('[data-edit="category"]')
        const remove = li.querySelector('[data-delete="category"]')

        edit.addEventListener('click', () => editCategory(category.name, category.id))

        remove.addEventListener('click', () => deleteCategory(category.id))

        element.insertAdjacentElement('beforeend', li)
    }

    fillCategories()
}

updatedCategories(listCategories)

/* ==================================== RESUMEN ====================================  */

const reports = $('#reports')
const notReports = $('#not-reports')

const updatedReports = (element, array) => {
    if(!element) return

    element.innerHTML = ''

    const profits = array.some(el => el.type === 'profits' )
    const spending = array.some(el => el.type === 'spending' )

    if(!array ||  array.length === 0 || !profits || !spending ) {
        reports.classList.add('hidden')
        notReports.classList.remove('hidden')
        return 
    }

    notReports.classList.add('hidden')
    reports.classList.remove('hidden')

       
    const resumenGeneric = resumen(array)
    const categories = highSpendingCategory(array)
    const operationsMonth = resumenByMonth(array)

    const htmlResumen = `
           <h3 class="text-lg font-semibold py-3">Resumen</h3>

            <div class="flex flex-col gap-4">
                <div class="grid grid-cols-3 gap-4 justify-between">
                    <span>Categoría con mayor gasto</span>
                    <label class="w-max truncate p-2 rounded bg-indigo-100 text-indigo-600">${
                        resumenGeneric.categoryMaxProfits[0] !== 'undefined' ? resumenGeneric.categoryMaxProfits[0] : 'categoría eliminada'
                    }</label>
                    <div class="truncate text-green-500 font-semibold flex justify-end">+$${resumenGeneric.categoryMaxProfits[1].profits}</div>
                </div>

                <div class="grid grid-cols-3 gap-4 justify-between">
                    <span>Categoría con mayor gasto</span>
                    <label class="w-max truncate p-2 rounded bg-indigo-100 text-indigo-600">${
                        resumenGeneric.categoryMaxSpending[0] !== 'undefined' ? resumenGeneric.categoryMaxSpending[0] : 'categoría eliminada'
                    }</label>
                    <div class="truncate text-red-500 font-semibold flex justify-end">-$${
                        resumenGeneric.categoryMaxSpending[1].spending ? resumenGeneric.categoryMaxSpending[1].spending : 'categoria eliminada'
                    }</div>
                </div>

                <div class="grid grid-cols-3 gap-4 justify-between">
                    <span>Categoría con mayor balance</span>
                    <label class="w-max truncate p-2 rounded bg-indigo-100 text-indigo-600">
                        ${
                            resumenGeneric.categoryBalance[0] !== 'undefined' ? resumenGeneric.categoryBalance[0] : 'categoría eliminada'
                        }
                    </label>
                    <div class="truncate text-blue-500 font-semibold flex justify-end">$${resumenGeneric.categoryBalance[1].balance}</div>
                </div>

                <div class="grid grid-cols-3 gap-4 justify-between">
                    <span>Mes con mayor ganancia</span>
                    <label>${resumenGeneric.monthMaxProfits[0]}</label>
                    <div class="truncate text-green-500 font-semibold flex justify-end">+$${resumenGeneric.monthMaxProfits[1].profits}</div>
                </div>

                <div class="grid grid-cols-3 gap-4 justify-between">
                    <span>Mes con mayor gasto</span>
                    <label>${resumenGeneric.monthMaxSpending[0]}</label>
                    <div class="truncate text-red-500 font-semibold flex justify-end">-$${resumenGeneric.monthMaxSpending[1].spending}</div>
                </div>
            </div>
       ` 
        
    let htmlCategories = ''

    for (const key in categories) {
        if (Object.hasOwnProperty(key)) return ''

        htmlCategories += `
            <tr class="grid grid-cols-4 gap-4">
                <td class="truncate">
                    <p class="truncate font-semibold">${key !== 'undefined' ? key : 'categoria eliminada'}</p>
                </td>
                <td>
                    <p class="truncate text-red-500 font-semibold">-${categories[key].spending}</p>
                </td>
                <td>
                    <p class="truncate text-green-500 font-semibold">+${categories[key].profits}</p>
                </td>
                <td>
                    <p class="truncate text-blue-500 font-semibold">$${categories[key].balance}</p>
                </td>
            </tr>
        `
    }

         
    let htmlMonth = ''

    for (const key in operationsMonth) {
        if (Object.hasOwnProperty(key)) return ''

        htmlMonth += `
            <tr class="grid grid-cols-4 gap-4 text-center">
                <td class="truncate">
                    <p class="truncate font-semibold">${key}</p>
                </td>
                <td>
                    <p class="truncate text-red-500 font-semibold">-${operationsMonth[key].spending}</p>
                </td>
                <td>
                    <p class="truncate text-green-500 font-semibold">+${operationsMonth[key].profits}</p>
                </td>
                <td>
                    <p class="truncate text-blue-500 font-semibold">$${operationsMonth[key].balance}</p>
                </td>
            </tr>
        `
    }
       

    element.innerHTML = `
        ${htmlResumen}

        <h3 class="text-lg font-semibold py-3">Totales por categoría</h3>

            <table class="w-full flex-col gap-2 py-4" id="table">
                <thead class="w-full block py-2">
                    <tr class="grid grid-cols-4">
                        <th>Categoria</th>
                        <th>Ganancia</th>
                        <th>Gasto</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                
                <tbody class="w-full flex flex-col gap-4 text-center">
                    ${htmlCategories}
                </tbody>
            </table>

            <h3 class="text-lg font-semibold py-3">Totales por mes</h3>
 
            <table class="w-full flex-col gap-2 py-4" id="table">
                <thead class="w-full block py-2">
                    <tr class="grid grid-cols-4 text-center">
                        <th>Mes</th>
                        <th>Ganancia</th>
                        <th>Gasto</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                
                <tbody class="w-full flex flex-col gap-4">
                    ${htmlMonth}
                </tbody>
            </table>
    `
}

updatedReports(reports, operations.getAll())


/* ==================================== OPERATIONS ==================================== */

const listOperations = $('#table-operations-desktop')
const formCreateOperation = $('#form-new-operation')
const formEditOperation = $('#form-edit-operation')
const notResults = $('#not-results')

// Edit
const editOperation = (operation, id) => {
    $('#modal-edit').classList.remove('hidden')
    $('#modal-create').classList.add('hidden')

    toggleModal()

    formEditOperation.setAttribute('data-id', id)
    formEditOperation['description'].value = operation?.description
    formEditOperation['amount'].value = operation?.amount
    formEditOperation['type'].value = operation?.type
    formEditOperation['category'].value = operation?.category
    formEditOperation['date'].value = operation?.date
}

// Delete
const deleteOperation = (id) => {
    operations.remove(id)
    updatedOperations(listOperations, operations.getAll())
}

// Form Create
formCreateOperation.addEventListener('submit', event => {
    event.preventDefault()

    const newOperation = {
        category: event.target['category'].value,
        description: event.target['description'].value,
        date: event.target['date'].value,
        amount: parseInt(event.target['amount'].value),
        type: event.target['type'].value
    }

    operations.create(newOperation)
    updatedOperations(listOperations, operations.getAll())
    toggleModal()
})

// Form Edit
formEditOperation.addEventListener('submit', event => {
    event.preventDefault()

    const newOperation = {
        category: event.target['category'].value,
        description: event.target['description'].value,
        date: event.target['date'].value,
        amount: parseInt(event.target['amount'].value),
        type: event.target['type'].value,
    }

    const id = event.target.getAttribute('data-id')

    operations.edit(id, newOperation)
    updatedOperations(listOperations, operations.getAll())
    toggleModal()
})

// Render and update balance
const updatedBalance = (array) => {
    const profits =  filterByType(array, 'profits').reduce((acc, operation) => acc + parseInt(operation.amount), 0)
    const spending = filterByType(array, 'spending').reduce((acc, operation) => acc + parseInt(operation.amount), 0)
    const total = profits - spending

    $('#text-profits').innerHTML = `+$${profits}`
    $('#text-spending').innerHTML = `-$${spending}`
    $('#text-total').innerHTML = `$${total}`
}

// Render and update
const updatedOperations = (element, array) => {
    if(!element) return

    // filters
    const type = $('#filter-by-type').value
    const category = $('#filter-by-category').value
    const date = $('#filter-by-date').value
    const order = $('#order-by').value

    let operations = filterByType(array, type)
    operations = filterByCategory(operations, category)
    operations = filterByDate(operations, date)
    operations = orderBy([...operations], order)

    element.innerHTML = ''

    if(!operations || operations?.length === 0) {
        element.innerHTML = ``
        $('#table').classList.add('hidden')
        notResults.classList.remove('hidden')
    } else {
        $('#table').classList.remove('hidden')
        notResults.classList.add('hidden')

        const tbody = document.createElement('tbody')
        tbody.setAttribute('class', 'w-full flex flex-col gap-4 text-center py-2')
        tbody.innerHTML = ''

        for (const operation of operations) {
            const tr = document.createElement('tr')

            tr.setAttribute('class', 'grid grid-cols-5')
            tr.setAttribute('id', operation.id)

            tr.insertAdjacentHTML('beforeend',
                `   <td class="truncate">
                        <p class="truncate font-semibold">${operation.description}</p>
                    </td>
                    <td>
                        <p class="flex justify-center">
                            <label class="w-max truncate p-2 rounded bg-indigo-100 text-indigo-600">${categories.get(operation.category)?.name ? categories.get(operation.category).name  : 'Categoria eliminada'}</label>
                        </p>
                    </td>
                    <td>
                        <p>${operation.date}</p>
                    </td>
                    <td>
                        ${operation.type === 'profits'
                            ? `<p class="truncate text-green-500 font-semibold">+$ ${operation.amount}</p>`
                            : `<p class="truncate text-red-500 font-semibold">-$ ${operation.amount}</p>`
                        }
                    </td>
                    <td>
                        <div class="flex gap-4 text-blue-400 cursor-pointer justify-center">
                            <button data-edit="operation">Editar</button>
                            <button data-delete="operation">Eliminar</button>
                        </div>
                    </td>
                `
            )

            const edit = tr.querySelector('[data-edit="operation"]')
            const remove = tr.querySelector('[data-delete="operation"]')

            edit?.addEventListener('click', () => editOperation(operation, operation.id))
            remove?.addEventListener('click', () => deleteOperation(operation.id))

            tbody.insertAdjacentElement('beforeend', tr)
        }

        element.append(tbody)
    }

    updatedBalance(operations)
    updatedReports(reports, array)
}

updatedOperations(listOperations, operations.getAll())

// Operations reactive by filters
$('#form-filter-operations').addEventListener('input', () => {
    updatedOperations(listOperations, operations.getAll())
})

