import {
    operations,
    categories,
    filterByType,
    filterByCategory,
    ordenarByAmount,
    ordenarByDescription
} from '../services/service.js'

const $root = document.getElementById('root')

// SIDEBAR
const sidebar = document.getElementById('sidebar')
const menuOpen = document.getElementById('menu-open')
const menuClose = document.getElementById('menu-close')
const listSidebar = document.getElementById('list-sidebar')



const openSidebar = () => sidebar.classList.replace('-left-full', 'left-0')
const closeSidebar = () => sidebar.classList.replace('left-0', '-left-full')

menuOpen.addEventListener('click', openSidebar)
menuClose.addEventListener('click', closeSidebar)
listSidebar.addEventListener('click', closeSidebar)

// MODAL

const modal = document.getElementById('modal')
const elements = Array.from(document.querySelectorAll('[data-toggle]'))

const toggleModal = () => {
    modal.classList.toggle('hidden')
    
    if(modal.classList.contains('hidden')) {
        $root.removeAttribute('disabled', '')
    } else {
        $root.setAttribute('disabled', '')
    }
} 

elements.map((el) => el.addEventListener('click', toggleModal))


/* ==================================== Validation input ==================================== */

const inputs = Array.from(document.querySelectorAll('input[required]'))

inputs?.map((el) => el.addEventListener('input', event => {
    const messageError = event.target.nextElementSibling

    if(!event.target.checkValidity()) {
        messageError.innerHTML = event.target.validationMessage
        return 
    }

    messageError.innerHTML = ''
}))


/* ==================================== BALANCE ==================================== */

const formNewOperation = document.getElementById('form-new-operation')
const inputsDate = Array.from(document.querySelectorAll('[type="date"]'))
const innerCategories = Array.from(document.querySelectorAll('[data-filter="filter-by-category"]'))
const listCategoryModal = document.getElementById('list-form-categories')
const tableOperationsDesktop = document.getElementById('table-operations-desktop')
const formsFilter = Array.from(document.querySelectorAll('[data-filterform]'))

// CREATE OPERATION
formNewOperation.addEventListener('submit', event => {
    const newOperation = {
        category: event.target['list-form-categories'].value,
        description: event.target['description'].value,
        date: event.target['date'].value,
        amount: event.target['amount'].value,
        type: event.target['type'].value,
    }

    operations.create(newOperation)
    renderOperations(tableOperationsDesktop)
    toggleModal()
})

const renderOperations = (array, element) => {
    const html = array?.reduce((acc, operation) =>  acc + `
        <tr class="grid grid-cols-5">
            <td class="truncate">
                <p class="truncate font-semibold">${operation.description}</p>
            </td>
            <td>
                <p class="flex justify-center">
                    <label class="w-max truncate p-2 rounded bg-indigo-100 text-indigo-600">${categories.get(operation.category).name}</label>
                </p>
            </td>
            <td>
                <p>${new Date(operation.date).toLocaleDateString('es-AR')}</p>
            </td>
            <td>
                ${operation.type === 'profits' 
                    ? `<p class="truncate text-green-500 font-semibold">+$ ${operation.amount}</p>`
                    : `<p class="truncate text-red-500 font-semibold">-$ ${operation.amount}</p>`
                }
            </td>
            <td>
                <div class="flex gap-4 text-blue-400 cursor-pointer justify-center">
                    <button>Editar</button>
                    <button>Eliminar</button>
                </div>
            </td>
        </tr>
    `, '')
    const operationsHTML = `
        <table class="hidden lg:flex flex-col gap-2 py-4">
            <thead class="w-full block py-2 border-b border-gray-200">
                <tr class="grid grid-cols-5">
                    <th>Descripción</th>
                    <th>Categoría</th>
                    <th>Fecha</th>
                    <th>Monto</th>
                    <th>Acciones</th>
                </tr>
            </thead>

            <tbody class="w-full flex flex-col gap-4 text-center " id="table-operations-desktop">
                ${html}
            </tbody>
        </table>`

    const empty = ` 
    <figure class="w-full py-6 flex flex-col gap-4 justify-center items-center hidden" id="not-result">
        <img class="w-full max-w-sm" src="./assets/img/wallet.svg" alt="No hay resultados">

        <figcaption class="flex flex-col gap-4 text-center">
            <span class="text-lg font-semibold">Sin resultados</span>
            <span>Cambia los filtros o agrega operaciones</span>
        </figcaption>
    </figure>`

    element.innerHTML = array?.length >= 1 ? operationsHTML : empty
}


renderOperations(operations.getAll(), tableOperationsDesktop)

// Render categories selects
const renderListCategories = (element) => {
    const html = categories.getAll()?.reduce((acc, category) => acc + `
        <option value="${category.id}">${category.name}</option>
    `, '')

    element.innerHTML = `<option value="all" selected>Todas</option> ${html} `
}
innerCategories.map(el => renderListCategories(el))
renderListCategories(listCategoryModal)


formsFilter.map((el) => {
    el['filter-by-type'].addEventListener('input', event => {
        const listType = filterByType(operations.getAll(), event.target.value)
        renderOperations(listType, tableOperationsDesktop)
    })

    el['filter-by-category'].addEventListener('input', event => {
        const listCategory = filterByCategory(operations.getAll(), event.target.value)
        renderOperations(listCategory, tableOperationsDesktop)
    })

    // el['filter-by-date'].addEventListener('input', event => {
    //     const listDate = filterByCategory(operations.getAll(), event.target.value)
    //     renderOperations(listDate, tableOperationsDesktop)
    // })

    el['order-by'].addEventListener('input', event => {
        switch (event.target.value) {
            case 'asc':
                const listAmountAsc = ordenarByAmount(operations.getAll(), 'asc')
                renderOperations(listAmountAsc, tableOperationsDesktop)
                break;
            case 'desc':
                const listAmountDesc = ordenarByAmount(operations.getAll(), 'desc')
                renderOperations(listAmountDesc, tableOperationsDesktop)
                break;
            case 'a-z':
                const listAsc = ordenarByDescription(operations.getAll(), 'a-z')
                renderOperations(listAsc, tableOperationsDesktop)
                break;
            case 'z-a':
                const listDesc = ordenarByDescription(operations.getAll(), 'z-a')
                renderOperations(listDesc, tableOperationsDesktop)
                break;
            default:
                break;
        }
    })
})





// Default values
inputsDate.map(el => el.value = new Date().toISOString().split('T')[0])

/* ==================================== CATEGORIES ==================================== */


const listCategories = document.getElementById('list-categories')
const formCreateCategory = document.getElementById('form-create-category')

// RENDER DATA
const renderCategories = (element) => {
    const html = categories.getAll()?.reverse()?.reduce((acc, category) => acc + `
        <li class="flex justify-between items-center gap-4" id="${category.id}">
            <label class="p-2 rounded bg-indigo-100 text-indigo-600">${category.name}</label>
            <div class="flex gap-4 text-blue-400 cursor-pointer justify-center">
                <button data-edit data-id="${category.id}" data-name="${category.name}">Editar</button>
                <button data-delete data-id="${category.id}" data-name="${category.name}">Eliminar</button>
            </div>
        </li>
    `, '')

    element.innerHTML = html

    // Delete category
    const buttonsDelete = Array.from(document.querySelectorAll('[data-delete]'))
    
    buttonsDelete.map((el) => el.addEventListener('click', event => {
        const id = event.target.getAttribute('data-id')
        categories.remove(id)
        renderCategories(listCategories)
    }))


    // Update category
    const buttonsEdit = Array.from(document.querySelectorAll('[data-edit]'))
    
    buttonsEdit.map((el) => el.addEventListener('click', event => {
        const id = event.target.getAttribute('data-id')
        const name = event.target.getAttribute('data-name')

        // redireccionar
        window.location.assign('#/categorias/editar') 

        const inputNameCategory = document.getElementById('rename')
        inputNameCategory.value = name

        const form = document.getElementById('form-edit-category')

        form.addEventListener('submit', event => {
            event.preventDefault()
            categories.edit(id, { name: event.target['rename'].value })
            renderCategories(listCategories)

            // redireccionar
            window.location.assign('#/categorias') 
        })
    }))


    // Cancel
    const buttonsCancel = Array.from(document.querySelectorAll('[data-cancel]'))
    
    buttonsCancel.map((el) => el.addEventListener('click', event => {
        // redireccionar
        window.location.assign('#/categorias') 
        renderCategories(listCategories)
    }))
}

renderCategories(listCategories)
// CREATE CATEGORY
formCreateCategory.addEventListener('submit', (event) => {
    event.preventDefault()

    categories.create({ name: event.target['name'].value })

    renderCategories(listCategories)

    event.target['name'].value = ''
})
