function iniciarWeb(){

    const seleccionarCategorias = document.querySelector('#categorias')
    const resultado = document.querySelector('#resultado')
    const modal = new bootstrap.Modal('#modal', {})

    if (seleccionarCategorias) {
        seleccionarCategorias.addEventListener('change', selectCategoria)
        obtenerCategorias()
    }
    const favsDiv = document.querySelector('.favoritos')
    if (favsDiv) {
        obtenerFavs()
    }


    async function obtenerCategorias(){
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php'
        // fetch(url)
        //     .then(respuesta => respuesta.json())
        //     .then(resultado => mostrarCategorias(resultado.categories))

        try {
            const respuesta = await fetch(url)
            const resultado = await respuesta.json()
            mostrarCategorias(resultado.categories)
        } catch (error) {
            console.log(error)
        }
    }

    function mostrarCategorias(categorias = []){
        categorias.forEach(categoria => {
            const option = document.createElement('option')
            option.value = categoria.strCategory
            option.textContent = categoria.strCategory
            seleccionarCategorias.appendChild(option)
        });
    }

    async function selectCategoria(e){
        const categoria = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`
        // fetch(url)
        //     .then(respuesta => respuesta.json())
        //     .then(resultado => mostrarResetas(resultado.meals))

        try {
            const respuesta = await fetch(url)
            const resultado = await respuesta.json()
            mostrarResetas(resultado.meals)
        } catch (error) {
            console.log(error)
        }
    }

    function mostrarResetas(recetas = []) {

        limpiarPantalla(resultado)

        const heading = document.createElement('h2')
        heading.classList.add('text-center', 'text-black', 'my-5')
        heading.textContent = recetas.length ? 'Resultados' : 'No Hay Resultados'
        resultado.appendChild(heading)

        recetas.forEach(receta => {
            const recetaContenedor = document.createElement('div')
            recetaContenedor.classList.add('col-md-4')

            const recetaCard = document.createElement('div')
            recetaCard.classList.add('card', 'mb-4')

            const recetaImagen = document.createElement('img')
            recetaImagen.classList.add('card-img-top')
            recetaImagen.alt = `Imagen de la receta ${receta.strMeal ?? receta.titulo}`
            recetaImagen.src = receta.strMealThumb ?? receta.img

            const recetaCardBody = document.createElement('div')
            recetaCardBody.classList.add('card-body')

            const recetaHeading = document.createElement('h3')
            recetaHeading.classList.add('card-title', 'mb-3')
            recetaHeading.textContent = receta.strMeal ?? receta.titulo

            const recetaButton = document.createElement('button')
            recetaButton.classList.add('btn', 'btn-primary', 'w-100')
            recetaButton.textContent = 'Ver Receta'
            // recetaButton.dataset.bsTarget = '#modal'
            // recetaButton.dataset.bsToggle = 'modal'
            recetaButton.onclick = function() {
                seleccionarReceta(receta.idMeal ?? receta.id)
            }

            recetaCardBody.appendChild(recetaHeading)
            recetaCardBody.appendChild(recetaButton)

            recetaCard.appendChild(recetaImagen)
            recetaCard.appendChild(recetaCardBody)

            recetaContenedor.appendChild(recetaCard)

            resultado.appendChild(recetaContenedor)
        });
    }

    async function seleccionarReceta(id){
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        // fetch(url)
        //     .then(resultado => resultado.json())
        //     .then(respuesta => mostrarRecetaModal(respuesta.meals[0]))

        try {
            const respuesta = await fetch(url)
            const resultado = await respuesta.json()
            mostrarRecetaModal(resultado.meals[0])
        } catch (error) {
            console.log(error)
        }
    }
    function mostrarRecetaModal(receta){
        const { idMeal, strInstructions, strMeal, strMealThumb } = receta

        const modalTitle = document.querySelector('.modal .modal-title')
        const modalBody = document.querySelector('.modal .modal-body')
        const toastHeader = document.querySelector('.toast-header')


        modalTitle.textContent = strMeal
        modalBody.innerHTML = `
            <img class="img-fluid" src="${strMealThumb}" alt="Receta ${strMeal}"/>
            <h3 class="my-3">Instrucciones</h3>
            <p>${strInstructions}</p>
            <h3 class="my-3">Ingredientes y cantidades</h3>
        `

        const listGroup = document.createElement('ul')
        listGroup.classList.add('list-group')

        for (let i = 1; i <= 20; i++) {
            if (receta[`strIngredient${i}`]) {
                const ingrediente = receta[`strIngredient${i}`]
                const cantidad = receta[`strMeasure${i}`]
    
                const ingredienteLi = document.createElement('li')
                ingredienteLi.classList.add('list-group-item')
                ingredienteLi.textContent = `${ingrediente} - ${cantidad}`
                
                listGroup.appendChild(ingredienteLi)
            }
        }

        modalBody.appendChild(listGroup)

        const modalFooter = document.querySelector('.modal-footer')
        limpiarPantalla(modalFooter)

        const btnFavs = document.createElement('button')
        btnFavs.classList.add('btn', 'btn-primary', 'col')
        btnFavs.textContent = storageExistente(idMeal) ? 'Eliminar Favorito' : 'Guardar Favorito'
        if(storageExistente(idMeal)){
            btnFavs.classList.add('btn-danger')
            toastHeader.classList.add('bg-danger')
        }else{
            btnFavs.classList.remove('btn-danger')
            btnFavs.classList.add('btn-primary')
            toastHeader.classList.remove('bg-danger')
            toastHeader.classList.add('bg-primary')
        }

        btnFavs.onclick = function() {

            if (storageExistente(idMeal)) {
                eliminarFavorito(idMeal)
                btnFavs.textContent = 'Guardar Favorito'
                btnFavs.classList.remove('btn-danger')
                btnFavs.classList.add('btn-primary')
                toastHeader.classList.add('bg-danger')
                
                toastMostrado('Eliminado Correctamente')
                return
            }

            agregarFavorito({
                id: idMeal,
                titulo: strMeal,
                img: strMealThumb
            })
            btnFavs.textContent = 'Eliminar Favorito'
            btnFavs.classList.add('btn-danger')

            toastHeader.classList.remove('bg-danger')
            toastHeader.classList.add('bg-primary')
            toastMostrado('Agregado Correctamente')
        }

        const btnCerrarModal = document.createElement('button')
        btnCerrarModal.classList.add('btn', 'btn-secondary', 'col')
        btnCerrarModal.textContent = 'Cerrar'
        btnCerrarModal.onclick = function(){
            modal.hide()
        }

        modalFooter.appendChild(btnFavs)
        modalFooter.appendChild(btnCerrarModal)

        modal.show()
    }

    function agregarFavorito(receta){
        const favs = JSON.parse(localStorage.getItem('favoritos')) ?? []
        localStorage.setItem('favoritos', JSON.stringify([...favs, receta]))
    }

    function eliminarFavorito(id) {
        const favs = JSON.parse(localStorage.getItem('favoritos')) ?? []
        const nuevosFavs = favs.filter(favorito => favorito.id !== id)

        localStorage.setItem('favoritos', JSON.stringify(nuevosFavs))
    }

    function storageExistente(id) {
        const favs = JSON.parse(localStorage.getItem('favoritos')) ?? []
        return favs.some(favorito => favorito.id === id)
    }

    function toastMostrado(mensaje){
        const toastDiv = document.querySelector('#toast')
        const toastBody = document.querySelector('.toast-body')
        const toast = new bootstrap.Toast(toastDiv)
        toastBody.textContent = mensaje
        toast.show()
    }

    function obtenerFavs(){
        const favs = JSON.parse(localStorage.getItem('favoritos')) ?? []
        if (favs.length) {
            mostrarResetas(favs)

            botonRecetear()
            return
        }
        const noFavs = document.createElement('p')
        noFavs.textContent = 'No hay favoritos aún'
        noFavs.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5')
        favsDiv.appendChild(noFavs)
    }

    function botonRecetear(){
        const botonDiv = document.createElement('div')
        const boton = document.createElement('button')
        botonDiv.classList.add('col-12', 'mx-auto', 'row')
        boton.classList.add('btn', 'btn-danger', 'mb-4', 'mx-auto', 'col-md-2', 'col-5', 'botonn')
        boton.textContent = 'Borrar Favoritos'
        botonDiv.appendChild(boton)
        resultado.appendChild(botonDiv)

        boton.onclick = function() {
            console.log('eliminando todo...')
            localStorage.clear();

            
            Swal.fire({
                title: 'Borrado con éxito!',
                text: 'Recarga la pagina para ver los cambios',
                icon: 'success'
            })
           
        }
    }

    function limpiarPantalla(parametro){
        while (parametro.firstChild) {
            parametro.removeChild(parametro.firstChild)
        }
    }
}

document.addEventListener('DOMContentLoaded', iniciarWeb)

