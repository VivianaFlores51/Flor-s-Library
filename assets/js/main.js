// Navegación móvil y estado activo
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
if (navToggle && siteNav){
  navToggle.addEventListener('click', ()=>{
    siteNav.classList.toggle('open');
  });
}

// Resaltar enlace activo según data-page
const currentPage = document.body.dataset.page;
if (currentPage){
  document.querySelectorAll('.site-nav .nav-link').forEach(link =>{
    const href = link.getAttribute('href')||'';
    if ((currentPage==='home' && href.includes('index')) ||
        (currentPage==='library' && href.includes('biblioteca')) ||
        (currentPage==='about' && href.includes('sobre-mi')) ||
        (currentPage==='contact' && href.includes('contacto'))){
      link.classList.add('is-active');
    }
  });
}

// Filtro de biblioteca
const grid = document.getElementById('library-grid');
if (grid){
  const categoryChips = document.querySelectorAll('[data-filter]');
  const statusChips = document.querySelectorAll('[data-status]');
  let activeCategory = 'all';
  let activeStatus = 'all';

  function applyFilters(){
    const items = grid.querySelectorAll('.card--book');
    items.forEach(item =>{
      const cat = item.getAttribute('data-category');
      const st = item.getAttribute('data-status');
      const showCategory = activeCategory==='all' || activeCategory===cat;
      const showStatus = activeStatus==='all' || activeStatus===st;
      item.style.display = (showCategory && showStatus) ? '' : 'none';
    });
  }

  categoryChips.forEach(chip =>{
    chip.addEventListener('click', ()=>{
      categoryChips.forEach(c=>c.classList.remove('is-active'));
      chip.classList.add('is-active');
      activeCategory = chip.dataset.filter || 'all';
      applyFilters();
    });
  });

  statusChips.forEach(chip =>{
    chip.addEventListener('click', ()=>{
      statusChips.forEach(c=>c.classList.remove('is-active'));
      chip.classList.add('is-active');
      activeStatus = chip.dataset.status || 'all';
      applyFilters();
    });
  });
}

// Formularios simples
function validateEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const newsletterForm = document.getElementById('form-newsletter');
if (newsletterForm){
  newsletterForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = newsletterForm.querySelector('input[name="email"]').value.trim();
    if (!validateEmail(email)){
      alert('Por favor, escribe un correo válido.');
      return;
    }
      alert('Gracias por unirte al club de lectura. ✨');
    newsletterForm.reset();
  });
}

const contactForm = document.getElementById('form-contacto');
if (contactForm){
  contactForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const nombre = contactForm.nombre.value.trim();
    const email = contactForm.email.value.trim();
    const asunto = contactForm.asunto.value.trim();
    const mensaje = contactForm.mensaje.value.trim();
    if (!nombre || !asunto || !mensaje || !validateEmail(email)){
      alert('Revisa los campos: nombre, correo válido, asunto y mensaje.');
      return;
    }
    alert('Tu mensaje fue enviado. 💌');
    contactForm.reset();
  });
}


// Lector integrado para biblioteca (PDF/EPUB via iframe)
const libraryGrid = document.getElementById('library-grid');
const readerEl = document.getElementById('reader');
const readerFrame = readerEl ? readerEl.querySelector('.reader__frame') : null;
const readerCloseBtn = readerEl ? readerEl.querySelector('.reader__close') : null;
const readerFinishBtn = readerEl ? readerEl.querySelector('.reader__finish') : null;
const readerOpenLink = readerEl ? readerEl.querySelector('.reader__openlink') : null;
let readerCurrentCard = null; // referencia a la tarjeta abierta

// Mapa de títulos -> archivo PDF exacto en assets/Libros
const TITLE_TO_FILE = (()=>{
  const map = new Map();
  function k(s){
    return (s||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  }
  map.set(k('Hábitos atómicos'), 'HABITOS-ATOMICOS-JAMES-CLEAR.pdf');
  map.set(k('Lean In'), 'Lean In PDF.pdf');
  map.set(k('Sapiens'), 'De-animales-a-dioses-Breve-historia-de-la-humanidad.pdf');
  map.set(k('El silencio de los corderos'), 'el_silencio_de_los_corderos.pdf');
  map.set(k('La chica del tren'), 'La_chica_del_tren_-_Paula_Hawkins.pdf');
  map.set(k('La sombra del viento'), 'La-sombra-del-viento-Carlos-Ruiz-Zafon-1.pdf');
  map.set(k('La canción de Aquiles'), 'la-cancion-de-aquiles-adn.pdf');
  map.set(k('El nombre del viento'), 'El-nombre-del-viento-Patrick-Rothfuss.pdf');
  map.set(k('Yo antes de ti'), 'jojo-moyes-yo-antes-de-ti.pdf');
  map.set(k('Orgullo y prejuicio'), 'orgullo_y_prejuicio.pdf');
  map.set(k('Eleanor & Park'), 'Eleanor-Park-Rainbow-Rowell.pdf');
  map.set(k('La ciudad de bronce'), 'La ciudad de bronce PDF.pdf');
  map.set(k('Canción de hielo y fuego: Juego de tronos'), 'Canción de Hielo y Fuego PDF.pdf');
  map.set(k('El poder de los hábitos'), 'El poder de los hábitos PDF.pdf');
  map.set(k('El nombre de la rosa'), 'Umberto Eco El Nombre de la Rosa.pdf');
  map.set(k('El sol y sus flores'), 'El Sol y sus Flores.pdf');
  map.set(k('Poeta en Nueva York'), 'García Lorca Federico - Poeta.pdf');
  map.set(k('El código Da Vinci'), 'El Código Da Vinci.pdf'); // Mapeo para El código Da Vinci
  map.set(k('Poemas de Alejandra'), 'alejandra-pizarnik.pdf'); // Mapeo para Poemas de Alejandra
  map.set(k('Veinte poemas de amor y una canción desesperada'), 'homenajepneruda0007.pdf'); // Mapeo para Neruda
  // Agrega más si subes nuevos PDFs con nombres distintos al título
  return map;
})();

function generateFilePathFromTitle(title){
  const slug = (title || '')
    .trim()
    .toLowerCase()
    .normalize('NFD') // separa acentos
    .replace(/[\u0300-\u036f]/g, '') // elimina diacríticos
    .replace(/&/g, ' y ')
    .replace(/[^a-z0-9\s-]/g, '') // quita símbolos
    .replace(/\s+/g, '-') // espacios a guiones
    .replace(/-+/g, '-'); // colapsa guiones
  return `assets/Libros/${slug}.pdf`;
}

async function checkFileExists(url){
  // Intenta una petición HEAD para verificar existencia.
  // En file:// puede fallar por CORS; en ese caso devolvemos null para no bloquear.
  try{
    const controller = new AbortController();
    const id = setTimeout(()=>controller.abort(), 2500);
    const res = await fetch(url, { method:'HEAD', cache:'no-store', signal: controller.signal });
    clearTimeout(id);
    return res.ok;
  }catch(_e){
    return null; // desconocido (p.ej., file://). No bloquear apertura.
  }
}

function updateCardStatus(card, newStatus){
  if (!card) return;
  // actualizar atributo
  card.setAttribute('data-status', newStatus);
  // actualizar chips visuales
  const meta = card.querySelector('.meta');
  if (meta){
    // reemplazar chip de estado (segunda chip dentro de .meta)
    const chips = meta.querySelectorAll('.chip');
    let stateChip = chips.length ? chips[chips.length - 1] : null;
    if (!stateChip){
      stateChip = document.createElement('span');
      stateChip.className = 'chip';
      meta.appendChild(stateChip);
    }
    if (newStatus === 'leyendo'){
      stateChip.innerHTML = '<i class="ri-book-open-line"></i> Leyendo';
    } else if (newStatus === 'finalizado'){
      stateChip.innerHTML = '<i class="ri-check-line"></i> Finalizado';
    }
  }
  // re-aplicar filtros vigentes
  if (typeof applyFilters === 'function'){
    // applyFilters es local arriba; replicamos pequeña lógica aquí
  }
  // Si hay filtros ya activos, respetarlos
  const activeCategoryChip = document.querySelector('[data-filter].is-active');
  const activeStatusChip = document.querySelector('[data-status].is-active');
  const activeCategory = activeCategoryChip ? (activeCategoryChip.getAttribute('data-filter') || 'all') : 'all';
  const activeStatus = activeStatusChip ? (activeStatusChip.getAttribute('data-status') || 'all') : 'all';
  const cat = card.getAttribute('data-category');
  const st = card.getAttribute('data-status');
  const showCategory = activeCategory === 'all' || activeCategory === cat;
  const showStatus = activeStatus === 'all' || activeStatus === st;
  card.style.display = (showCategory && showStatus) ? '' : 'none';
}

function openReader(src, title, card){
  if (!readerEl || !readerFrame){
    alert('El lector no está disponible.');
    return;
  }
  if (!src){
    alert('Este libro aún no tiene archivo para leer.');
    return;
  }
  // Guardar tarjeta actual y marcar como leyendo
  readerCurrentCard = card || null;
  if (readerCurrentCard){
    updateCardStatus(readerCurrentCard, 'leyendo');
  }
  // Establecer título accesible
  const titleEl = readerEl.querySelector('#reader-title');
  if (titleEl){ titleEl.textContent = title ? `Leyendo: ${title}` : 'Lector'; }
  readerFrame.src = src;
  if (readerOpenLink){ readerOpenLink.href = src; readerOpenLink.title = `Abrir: ${src}`; }
  readerEl.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeReader(){
  if (!readerEl){ return; }
  readerEl.hidden = true;
  if (readerFrame){ readerFrame.src = ''; }
  document.body.style.overflow = '';
}

if (libraryGrid){
  // Quitar visualmente el chip "Pendiente" existente
  libraryGrid.querySelectorAll('.card--book .meta').forEach(meta =>{
    const chips = Array.from(meta.querySelectorAll('.chip'));
    const lastChip = chips[chips.length - 1];
    if (lastChip && /Pendiente/i.test(lastChip.textContent || '')){
      lastChip.remove();
    }
  });

  // Insertar botón "Leer" a cada tarjeta (si no hay archivo avisamos)
  libraryGrid.querySelectorAll('.card--book').forEach(card =>{
    let file = card.getAttribute('data-file');
    const actions = document.createElement('div');
    actions.className = 'form__actions';
    const btn = document.createElement('button');
    btn.className = 'btn btn--primary';
    btn.type = 'button';
    btn.innerHTML = '<i class="ri-book-open-line"></i> Leer';
    // Mostrar sugerencia de nombre esperado si no hay data-file
    const title = card.querySelector('h3')?.textContent?.trim() || 'Libro';
    btn.title = 'Abrir';
    btn.addEventListener('click', ()=>{
      const title = card.querySelector('h3')?.textContent?.trim() || 'Libro';
      const run = async ()=>{
        // Si ya está definida la ruta, usarla
        if (file){
          const exists = await checkFileExists(file);
          if (exists === false){
            alert(`No encontré el archivo para este libro.\nRuta: ${file}\nColócalo ahí o define otra ruta en data-file.`);
            return;
          }
          btn.title = `Abrir: ${file}`;
          openReader(file, title, card);
          return;
        }

        // Probar mapeo explícito primero
        const titleKey = (title||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
        if (TITLE_TO_FILE.has(titleKey)){
          const mapped = `assets/Libros/${TITLE_TO_FILE.get(titleKey)}`;
          const ok = await checkFileExists(mapped);
          if (ok !== false){
            card.setAttribute('data-file', mapped);
            btn.title = `Abrir: ${mapped}`;
            openReader(mapped, title, card);
            return;
          }
        }

        // Probar rutas candidatas derivadas del título
        const base = (title || '').trim();
        const lowered = base.toLowerCase();
        const noDiac = lowered.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
        const noSymbols = noDiac.replace(/&/g,' y ').replace(/[^a-z0-9\s-]/g,'');
        const withSpaces = noSymbols.replace(/\s+/g,' ');
        const withDashes = withSpaces.replace(/\s+/g,'-').replace(/-+/g,'-');
        const withUnderscores = withSpaces.replace(/\s+/g,'_').replace(/_+/g,'_');

        const variants = [withDashes, withUnderscores, withSpaces];
        const folders = ['assets/Libros', 'assets/libros', 'assets'];
        const candidates = [];
        for (const folder of folders){
          for (const v of variants){
            candidates.push(`${folder}/${v}.pdf`);
            // variantes con sufijo " pdf"/" PDF" antes de la extensión
            candidates.push(`${folder}/${v} pdf.pdf`);
            candidates.push(`${folder}/${v} PDF.pdf`);
          }
        }
        // También probar nombre original con guiones bajos (por si ya vino así)
        const originalUnderscore = base.replace(/\s+/g,'_');
        for (const folder of folders){
          candidates.push(`${folder}/${originalUnderscore}.pdf`);
          candidates.push(`${folder}/${originalUnderscore} pdf.pdf`);
          candidates.push(`${folder}/${originalUnderscore} PDF.pdf`);
        }

        try{ console.debug('Buscando archivo para', title, candidates); }catch(_e){}

        let chosen = null;
        for (const c of candidates){
          const ok = await checkFileExists(c);
          if (ok === true){ chosen = c; break; }
          if (ok === null){ // desconocido (file://), elegimos la primera directamente
            chosen = candidates[0];
            break;
          }
        }
        
        if (!chosen) {
          alert(`No se encontró el archivo PDF para "${title}".\n\nPor favor, asegúrate de que el archivo esté en la carpeta "assets/Libros" con un nombre similar al título del libro.`);
          return;
        }
        
        card.setAttribute('data-file', chosen);
        btn.title = `Abrir: ${chosen}`;
        openReader(chosen, title, card);
      };
      run();
    });
    actions.appendChild(btn);
    card.appendChild(actions);
  });
}

// Cierre del lector
if (readerEl){
  readerEl.addEventListener('click', (e)=>{
    const target = e.target;
    if (target instanceof Element && (target.matches('.reader__backdrop') || target.closest('.reader__close'))){
      closeReader();
    }
  });
  if (readerFinishBtn){
    readerFinishBtn.addEventListener('click', ()=>{
      if (readerCurrentCard){
        updateCardStatus(readerCurrentCard, 'finalizado');
      }
      closeReader();
    });
  }
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape' && !readerEl.hidden){
      closeReader();
    }
  });
}

