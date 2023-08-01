
/**
 * referencias a los elementos del DOM.
 */ 
const formCotizador = document.querySelector('#formCotizador');
const formSelectorBizcochos = document.querySelector('#selectTipoBizcocho');
const formSelectorRellenos = document.querySelector('#selectRelleno');
const formSelectorCoberturas = document.querySelector('#selectCobertura');
const formCheckDecoracion = document.querySelector('#checkDecoracion');
const formBtnCalcular = document.querySelector('#btnCalcular');

const detalleBizcocho = document.querySelector('#detalleBizcocho');
const precioBizcocho = document.querySelector('#precioBizcocho');

const detalleRelleno = document.querySelector('#detalleRelleno');
const precioRelleno = document.querySelector('#precioRelleno');

const detalleCobertura = document.querySelector('#detalleCobertura');
const precioCobertura = document.querySelector('#precioCobertura');

const detalleDecoracion = document.querySelector('#detalleDecoracion');
const precioDecoracion = document.querySelector('#precioDecoracion');

const precioTotal = document.querySelector('#precioTotal');


const cotizacionePreviasModal = document.getElementById('cotizacionesGuardadas');

let ultimaCotizacion = null;

/**
 * Cotizacion seleccionada por el usuario.
 */
class Cotizacion {
  constructor(bizcocho, relleno, cobertura, decoracion){
    this.bizcocho = bizcocho;
    this.relleno = relleno;
    this.cobertura = cobertura;
    this.decoracion = decoracion;
  };
}


/**
 * DetallePrecio precio detallado de la cotizacion seleccionada por el usuario.
 */
class DetallePrecio {
  constructor(base, detalleBizcocho, precioBizcocho, detalleRelleno, precioRelleno, detalleCobertura, precioCobertura, precioDecoracion){
    this.base = base;
    this.detalleBizcocho = detalleBizcocho;
    this.precioBizcocho = precioBizcocho;
    
    this.detalleRelleno = detalleRelleno;
    this.precioRelleno = precioRelleno;

    this.detalleCobertura = detalleCobertura;
    this.precioCobertura = precioCobertura;
    
    this.precioDecoracion = precioDecoracion;
  };

  total(){
    return this.base + this.precioBizcocho + this.precioRelleno + this.precioCobertura + this.precioDecoracion;
  }
}


/**
 * Cotizador clase principal con la logica del cotizador.
 */
class Cotizador {

  constructor(preciosBase, bizcochos, rellenos, coberturas) {
    this.preciosBase = preciosBase;
    this.bizcochos = bizcochos;
    this.rellenos = rellenos;
    this.coberturas = coberturas;
  };

  /**
   * obtiene las opciones del usuario del cotizador.
   * @returns la cotizacion del usuario.
   */
  obtenerCotizacion(){
    let bizcochoSeleccionado = formSelectorBizcochos.value;
    console.log("Bizcocho seleccionado", bizcochoSeleccionado);

    let rellenoSeleccionado = formSelectorRellenos.value;
    console.log("Relleno seleccionado", rellenoSeleccionado);

    let coberturaSeleccionado = formSelectorCoberturas.value;
    console.log("Cobertura seleccionada", coberturaSeleccionado)

    let decoracionSeleccionada = formCheckDecoracion.checked;
    console.log("Con decoracion", decoracionSeleccionada);
    
    return new Cotizacion(bizcochoSeleccionado, rellenoSeleccionado, coberturaSeleccionado, decoracionSeleccionada);
  };

  /**
   * Funcion que calcula el costo detallado de la torta dados los parametros completados por el usuario
   */
  cotizar(cotizacion){

    let costoBase = this.preciosBase.base;

    // Precio bizcocho
    const rBizcocho = this.bizcochos.find(({ code }) => code === cotizacion.bizcocho);
    console.log(rBizcocho);
    const costoBizcocho = this.preciosBase.bizcocho + ((rBizcocho !== undefined)? rBizcocho.precio : 0);
    const detalleBizcocho = (rBizcocho !== undefined)? rBizcocho.nombre : '';
    
    // Precio relleno
    const rRelleno = this.rellenos.find(({ code }) => code === cotizacion.relleno);
    console.log(rRelleno);
    const costoRelleno = this.preciosBase.relleno + ((rRelleno !== undefined)? rRelleno.precio : 0);
    const detalleRelleno = (rRelleno !== undefined)? rRelleno.nombre : '';

    // Precio Cobertura
    const rCobertura = this.coberturas.find(({ code }) => code === cotizacion.cobertura);
    console.log(rCobertura);
    const costoCobertura = this.preciosBase.cobertura + ((rCobertura !== undefined)? rCobertura.precio : 0);
    const detalleCobertura = (rCobertura !== undefined)? rCobertura.nombre : '';

    // Precio Decoracion
    let costoDecoracion = 0;
    if(cotizacion.decoracion === true) {
      costoDecoracion = this.preciosBase.decoracion;
    }

    return new DetallePrecio(costoBase, detalleBizcocho, costoBizcocho, detalleRelleno, costoRelleno, detalleCobertura, costoCobertura, costoDecoracion);
  }
}



/**
 * Funcion que carga los selectores del formulario con los datos obtenidos del backend (emulados en el archivo presets.js)
 *
 * @param {Element} elem es el elemento de referencia al selector en el DOM
 * @param {Array} options son las opciones a cargar en el selector dado
 */
function cargarSelector(elem, options) {
  options.forEach(element => {
    elem.innerHTML += `<option value="${element.code}">${element.nombre}</option>`;
  });
};



/**
   * obtiene la cotizacion del dolar blue.
   */
 async function obtenerValorDolar(){
  let val = await fetch('https://dolar-api-argentina.vercel.app/v1/dolares/blue', {
    method: "GET",
    headers: {"Content-type": "application/json;charset=UTF-8"}
  })
    .then((res)=>res.json())
    .catch((error) => console.error("Error: ", error))
    .then((response) => {
      console.log(response);
      return response.compra
    });

    return val;
};


/**
 * Funcion que agrega el evento click al boton del formulario del cotizador.
 * @param {Element} btn 
 * @param {Cotizador} cotizador 
 */
function agregarEventoClick(btn, cotizador) {
  btn.addEventListener('click', (event)=>{
    form = formCotizador;
    form.classList.add('was-validated');
    if (form.checkValidity()) {

      // validacion exitosa
      let cotizacion = cotizador.obtenerCotizacion();
      let detallePrecio = cotizador.cotizar(cotizacion);

      detalleBizcocho.textContent = detallePrecio.detalleBizcocho;
      precioBizcocho.textContent = `$${detallePrecio.precioBizcocho}`;

      detalleRelleno.textContent = detallePrecio.detalleRelleno;
      precioRelleno.textContent = `$${detallePrecio.precioRelleno}`;

      detalleCobertura.textContent = detallePrecio.detalleCobertura;
      precioCobertura.textContent = `$${detallePrecio.precioCobertura}`;

      if(detallePrecio.precioDecoracion === 0) {
        detalleDecoracion.textContent = 'Sin decoración';
        precioDecoracion.textContent = '$0';
      } else {
        detalleDecoracion.textContent = 'Incluye decoración';
        precioDecoracion.textContent = `$${detallePrecio.precioDecoracion}`;
      }
      

      let valorDolarBlue =  obtenerValorDolar();
      valorDolarBlue.then(dolarBlue=>{
        const totalEnPesos = detallePrecio.total();
        const totalEnDolares = totalEnPesos / dolarBlue;
        precioTotal.textContent = `$${detallePrecio.total()} (usd ${totalEnDolares.toFixed(2)})`;
      });

      guardarCotizacion(detallePrecio);
      
    }

    event.preventDefault();
    event.stopPropagation();
  }, false);
};


function guardarCotizacion(ultimaCotizacion) {
  let cotizacionesAnteriores = []
    let str = localStorage.getItem("ultimaCotizacion")
    if (str != null) {
      cotizacionesAnteriores = JSON.parse(str);
      console.log("Anteriores", cotizacionesAnteriores); 
    }

    // store the objects
    cotizacionesAnteriores.push(ultimaCotizacion);
    localStorage.setItem("ultimaCotizacion",JSON.stringify(cotizacionesAnteriores));
}

function agregarEventoLimpiarCotizaciones(){
  let btn = document.querySelector('#btnLimpiar');
  btn.addEventListener('click', ()=>{
    localStorage.removeItem("ultimaCotizacion");
  });
};


function agregarEventoVerCotizaciones(){
 
  if (cotizacionePreviasModal) {
    cotizacionePreviasModal.addEventListener('show.bs.modal', event => {
      // Button that triggered the modal
      const button = event.relatedTarget
      
      let cotizacionesAnteriores = []
      let str = localStorage.getItem("ultimaCotizacion")
      if (str != null) {
        cotizacionesAnteriores = JSON.parse(str);
        console.log("Anteriores", cotizacionesAnteriores); 
      }

      let bodycont = "";
      cotizacionesAnteriores.forEach((elem)=>{

        let instance = Object.assign(new DetallePrecio(), elem);

        if(elem != null && elem.base > 0){
          console.log(elem);
          bodycont += `<div class="card">
          <div class="card-body">
            <h5 class="card-title">Total: $${instance.total()}</h5>
            <h6 class="card-subtitle mb-2 text-body-secondary">Base: $${elem.base}</h6>
            <h6 class="card-subtitle mb-2 text-body-secondary">Bizcocho: ${elem.detalleBizcocho} $${elem.precioBizcocho}</h6>
            <h6 class="card-subtitle mb-2 text-body-secondary">Relleno: ${elem.detalleRelleno} $${elem.precioRelleno}</h6>
            <h6 class="card-subtitle mb-2 text-body-secondary">Cobertura: ${elem.detalleCobertura} $${elem.precioCobertura}</h6>
            <h6 class="card-subtitle mb-2 text-body-secondary">Decoracion: ${(elem.precioDecoracion > 0)?"Si $"+ elem.precioDecoracion : "No"}</h6>
          </div>
        </div>
        <br/>`
        }
      })


      let modalBody = document.getElementById('cotizacionePreviasBody');
      modalBody.innerHTML = bodycont;//JSON.stringify(cotizacionesAnteriores);
    })
  }
};

cargarSelector(formSelectorBizcochos, datosFromBackend['bizcochos']);
cargarSelector(formSelectorRellenos, datosFromBackend['rellenos']);
cargarSelector(formSelectorCoberturas, datosFromBackend['coberturas']);

// Construccion de una instancia del objeto Cotizador
let cotizador = new Cotizador(datosFromBackend['precios'], datosFromBackend['bizcochos'], datosFromBackend['rellenos'], datosFromBackend['coberturas']);

agregarEventoClick(formBtnCalcular, cotizador);
agregarEventoLimpiarCotizaciones();
agregarEventoVerCotizaciones();



