// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

    // --- ESTADO GLOBAL DE LA APLICACIÓN (Simulación de Base de Datos) ---
    
    // Estado de la Tienda y Productos
    let storeSettings = {
        name: "Kore POS",
        currency: "MXN",
        tax: 16 // 16% de IVA
    };

    let products = [
        { id: 1, name: "Pizza Margarita", price: 120.50, stock: 30 },
        { id: 2, name: "Refresco Grande", price: 35.00, stock: 50 },
        { id: 3, name: "Papas Fritas", price: 45.00, stock: 15 },
        { id: 4, name: "Hamburguesa", price: 80.00, stock: 0 } // Producto sin stock
    ];
    let nextProductId = 5;
    
    // Estado de Plugins (falso = no comprado/activado)
    let pluginState = {
        reports: false,
        inventory: true,
        crm: false
    };

    // Estado de Ventas
    let currentSale = []; // Array de { productId, name, price, quantity }
    let salesHistory = []; // Array de { id, date, items, subtotal, tax, total }
    let nextSaleId = 1;

    // Referencias a elementos clave de Navegación
    const mainContent = document.getElementById('main-content');
    const navVender = document.getElementById('nav-vender');
    const navProducts = document.getElementById('nav-products');
    const navHistorial = document.getElementById('nav-historial');
    const navReports = document.getElementById('nav-reports');
    const navPlugins = document.getElementById('nav-plugins');
    const navConfiguracion = document.getElementById('nav-configuracion');
    const storeNameSidebar = document.getElementById('store-name-sidebar');


    // =================================================================
    // --- PLANTILLAS HTML (TEMPLATES) PARA CADA VISTA ---
    // =================================================================

    // Plantilla para la Terminal de Venta
    const venderViewHTML = `
        <div class="pos-layout">
            <div class="pos-products">
                <h2>Seleccionar Productos</h2>
                <div class="pos-products-grid" id="pos-products-grid"></div>
            </div>
            <div class="pos-ticket">
                <h2>Ticket de Venta</h2>
                <ul class="pos-ticket-items" id="pos-ticket-items"></ul>
                <div class="pos-total">
                    <p id="pos-subtotal" style="font-size: 0.9em; color: #555;">Subtotal: $0.00</p>
                    <p id="pos-tax" style="font-size: 0.9em; color: #555;">IVA (${storeSettings.tax}%): $0.00</p>
                    <h2 class="total-final">Total: <span id="pos-total-amount">$0.00</span></h2>
                </div>
                <div class="pos-actions">
                    <button class="btn btn-danger" id="btn-cancel-sale">Cancelar</button>
                    <button class="btn btn-primary" id="btn-checkout">Cobrar</button>
                </div>
            </div>
        </div>
    `;

    // Plantilla para la página de Productos (CRUD)
    const productsViewHTML = `
        <h1>Gestión de Productos</h1>
        <div class="card">
            <h2>Añadir / Editar Producto</h2>
            <form id="product-form" data-mode="add" data-edit-id="">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="product-name">Nombre</label>
                        <input type="text" id="product-name" required>
                    </div>
                    <div class="form-group">
                        <label for="product-price">Precio (Sin IVA)</label>
                        <input type="number" id="product-price" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="product-stock">Inventario (Stock)</label>
                        <input type="number" id="product-stock" min="0" required>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary" id="form-submit-btn">Añadir Producto</button>
                <button type="button" class="btn btn-secondary" id="form-cancel-btn" style="display: none;">Cancelar Edición</button>
            </form>
        </div>
        <div class="card">
            <h2>Lista de Productos</h2>
            <table class="product-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="product-list"></tbody>
            </table>
        </div>
    `;

    // Plantilla para la página de Plugins
    const pluginsViewHTML = `
        <h1>Tienda de Plugins</h1>
        <p>Activa módulos adicionales para potenciar tu POS.</p>
        <div class="plugin-grid">
            <div class="plugin-card">
                <h3>🔌 Inventario Avanzado</h3>
                <p>Gestión de lotes, caducidades y multi-almacén.</p>
                <button class="btn" data-plugin="inventory" id="btn-plugin-inventory" disabled>Activado (Core)</button>
            </div>
            <div class="plugin-card">
                <h3>📊 Reportes Financieros</h3>
                <p>Análisis de ventas, ganancias y proyecciones.</p>
                <button class="btn btn-primary" data-plugin="reports" id="btn-plugin-reports">
                    Activar por $199/mes
                </button>
            </div>
            <div class="plugin-card">
                <h3>👥 CRM y Lealtad</h3>
                <p>Base de datos de clientes y sistema de puntos.</p>
                <button class="btn btn-primary" data-plugin="crm" id="btn-plugin-crm">
                    Activar por $149/mes
                </button>
            </div>
        </div>
    `;

    // --- NUEVAS PLANTILLAS ---

    // Plantilla para Historial de Ventas
    const historialViewHTML = `
        <h1>Historial de Ventas</h1>
        <div class="card">
            <table class="sales-history-table">
                <thead>
                    <tr>
                        <th>ID Venta</th>
                        <th>Fecha</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="sales-history-list">
                    </tbody>
            </table>
        </div>
        
        <div class="sale-details-modal" id="sale-details-modal">
            <div class="sale-details-content">
                <button class="close-btn" id="close-details-modal-btn">&times;</button>
                <h3 id="sale-details-title">Detalle de Venta</h3>
                <div id="sale-details-body"></div>
            </div>
        </div>
    `;

    // Plantilla para Reportes
    const reportesViewHTML = `
        <h1>Reportes y Analítica</h1>
        <div class="reports-grid">
            <div class="report-card">
                <h3>Ventas Totales (${storeSettings.currency})</h3>
                <div class="value" id="report-total-revenue">$0.00</div>
            </div>
            <div class="report-card">
                <h3>Total de Transacciones</h3>
                <div class="value" id="report-total-sales">0</div>
            </div>
            <div class="report-card">
                <h3>Ticket Promedio</h3>
                <div class="value" id="report-avg-ticket">$0.00</div>
            </div>
        </div>
        <div class="card">
            <h2>Producto Más Vendido</h2>
            <h3 id="report-top-product">--</h3>
        </div>
    `;

    // Plantilla para Configuración
    const configuracionViewHTML = `
        <h1>Configuración de la Tienda</h1>
        <div class="card">
            <form id="settings-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="store-name">Nombre de la Tienda</label>
                        <input type="text" id="store-name" required>
                    </div>
                    <div class="form-group">
                        <label for="store-currency">Moneda</label>
                        <input type="text" id="store-currency" placeholder="Ej: MXN, USD" required>
                    </div>
                    <div class="form-group">
                        <label for="store-tax">Impuesto (% IVA)</label>
                        <input type="number" id="store-tax" min="0" max="100" step="1">
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">Guardar Cambios</button>
            </form>
        </div>
    `;


    // =================================================================
    // --- FUNCIONES DE RENDERIZADO DE VISTAS (CONTROLADORES) ---
    // =================================================================

    function showVenderView() {
        mainContent.innerHTML = venderViewHTML;
        setActiveNav(navVender);
        renderPOSProductGrid();
        renderPOSTicket();

        // Enlazar eventos de la terminal
        document.getElementById('pos-products-grid').addEventListener('click', handlePOSProductClick);
        document.getElementById('pos-ticket-items').addEventListener('click', handlePOSTicketClick);
        document.getElementById('btn-cancel-sale').addEventListener('click', cancelSale);
        document.getElementById('btn-checkout').addEventListener('click', handleCheckout);
    }

    function showProductsView() {
        mainContent.innerHTML = productsViewHTML;
        setActiveNav(navProducts);
        
        const productForm = document.getElementById('product-form');
        const productList = document.getElementById('product-list');
        const cancelBtn = document.getElementById('form-cancel-btn');

        productForm.addEventListener('submit', handleFormSubmit);
        productList.addEventListener('click', handleTableClick);
        cancelBtn.addEventListener('click', cancelEdit);

        renderProductList();
    }

    function showPluginsView() {
        mainContent.innerHTML = pluginsViewHTML;
        setActiveNav(navPlugins);
        
        document.querySelector('.plugin-grid').addEventListener('click', handlePluginClick);
        updatePluginButtons(); // Sincroniza el estado visual
    }

    // --- NUEVAS VISTAS ---

    function showHistorialView() {
        mainContent.innerHTML = historialViewHTML;
        setActiveNav(navHistorial);
        renderHistorialTable();

        // Eventos del Modal
        document.getElementById('close-details-modal-btn').addEventListener('click', () => {
            document.getElementById('sale-details-modal').classList.remove('show');
        });
        document.getElementById('sales-history-list').addEventListener('click', handleViewSaleDetails);
    }

    function showReportesView() {
        // Verifica si el plugin está activo ANTES de mostrar
        if (!pluginState.reports) {
            alert('¡Función bloqueada! Debes activar el plugin de "Reportes" primero.');
            showPluginsView(); // Lleva al usuario a la tienda
            return;
        }

        mainContent.innerHTML = reportesViewHTML;
        setActiveNav(navReports);
        renderReportesDashboard();
    }

    function showConfiguracionView() {
        mainContent.innerHTML = configuracionViewHTML;
        setActiveNav(navConfiguracion);

        // Cargar datos actuales en el formulario
        document.getElementById('store-name').value = storeSettings.name;
        document.getElementById('store-currency').value = storeSettings.currency;
        document.getElementById('store-tax').value = storeSettings.tax;
        
        // Enlazar evento
        document.getElementById('settings-form').addEventListener('submit', handleSettingsSave);
    }

    // =================================================================
    // --- LÓGICA DE LA TERMINAL DE VENTA (POS) ---
    // =================================================================

    function renderPOSProductGrid() {
        const grid = document.getElementById('pos-products-grid');
        if (!grid) return;
        grid.innerHTML = '';
        
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'pos-product-card';
            card.dataset.id = product.id;
            
            if (product.stock <= 0) card.classList.add('out-of-stock');

            card.innerHTML = `
                <h4>${product.name}</h4>
                <div class="price">$${product.price.toFixed(2)}</div>
                <div class="stock">Stock: ${product.stock}</div>
            `;
            grid.appendChild(card);
        });
    }

    function renderPOSTicket() {
        const ticketItems = document.getElementById('pos-ticket-items');
        if (!ticketItems) return;
        ticketItems.innerHTML = '';
        
        let subtotal = 0;

        currentSale.forEach(item => {
            const li = document.createElement('li');
            li.className = 'pos-ticket-item';
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            li.innerHTML = `
                <span class="name">${item.name}</span>
                <span class="qty">x${item.quantity}</span>
                <span class="price">$${itemTotal.toFixed(2)}</span>
                <span class="remove" data-id="${item.productId}">X</span>
            `;
            ticketItems.appendChild(li);
        });

        // Calcular impuestos y total
        const taxAmount = subtotal * (storeSettings.tax / 100);
        const total = subtotal + taxAmount;

        // Actualizar totales en la UI
        document.getElementById('pos-subtotal').textContent = `Subtotal: $${subtotal.toFixed(2)}`;
        document.getElementById('pos-tax').textContent = `IVA (${storeSettings.tax}%): $${taxAmount.toFixed(2)}`;
        document.getElementById('pos-total-amount').textContent = `$${total.toFixed(2)}`;
    }

    function handlePOSProductClick(e) {
        const card = e.target.closest('.pos-product-card');
        if (!card) return;

        const productId = parseInt(card.dataset.id);
        const product = products.find(p => p.id === productId);

        if (product.stock <= 0) {
            alert('Producto agotado');
            return;
        }
        
        addToSale(productId);
    }

    function addToSale(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = currentSale.find(item => item.productId === productId);
        let currentQtyInCart = existingItem ? existingItem.quantity : 0;

        if (currentQtyInCart >= product.stock) {
            alert('No hay más stock disponible para este producto.');
            return;
        }

        if (existingItem) {
            existingItem.quantity++;
        } else {
            currentSale.push({
                productId: product.id,
                name: product.name,
                price: product.price, // Precio base (sin IVA)
                quantity: 1
            });
        }
        renderPOSTicket();
    }

    function handlePOSTicketClick(e) {
        if (!e.target.classList.contains('remove')) return;
        const productId = parseInt(e.target.dataset.id);
        
        // Lógica modificada para remover
        const itemIndex = currentSale.findIndex(item => item.productId === productId);
        if (itemIndex === -1) return;

        if (currentSale[itemIndex].quantity > 1) {
            currentSale[itemIndex].quantity--;
        } else {
            currentSale.splice(itemIndex, 1);
        }
        renderPOSTicket();
    }

    function cancelSale() {
        if (currentSale.length > 0 && confirm('¿Cancelar la venta actual?')) {
            currentSale = [];
            renderPOSTicket();
        }
    }

    // --- ¡LÓGICA DE CHECKOUT ACTUALIZADA! ---
    function handleCheckout() {
        if (currentSale.length === 0) {
            alert('El ticket está vacío.');
            return;
        }

        // Calcular totales finales
        const subtotal = currentSale.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const taxAmount = subtotal * (storeSettings.tax / 100);
        const total = subtotal + taxAmount;
        
        if (confirm(`Total a cobrar: $${total.toFixed(2)}. ¿Continuar?`)) {
            
            // 1. Crear el registro de la venta
            const saleRecord = {
                id: nextSaleId++,
                date: new Date(), // Guarda la fecha y hora exactas
                items: [...currentSale], // Copia profunda de los items
                subtotal: subtotal,
                tax: taxAmount,
                total: total
            };
            salesHistory.push(saleRecord); // ¡Añade al historial!

            // 2. Actualizar el inventario (stock)
            currentSale.forEach(saleItem => {
                const productInStock = products.find(p => p.id === saleItem.productId);
                if (productInStock) {
                    productInStock.stock -= saleItem.quantity;
                }
            });

            alert('¡Venta realizada con éxito!');
            
            // 3. Limpiar y refrescar
            currentSale = [];
            renderPOSTicket(); // Muestra el ticket vacío
            renderPOSProductGrid(); // Muestra el nuevo stock en la terminal
            console.log("Historial de Ventas:", salesHistory); // Para depuración
        }
    }


    // =================================================================
    // --- LÓGICA DE CRUD DE PRODUCTOS ---
    // =================================================================

    function renderProductList() {
        const productList = document.getElementById('product-list');
        if (!productList) return;
        productList.innerHTML = '';
        
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td class="actions">
                    <button class="btn btn-secondary btn-edit" data-id="${product.id}">Editar</button>
                    <button class="btn btn-danger btn-delete" data-id="${product.id}">Borrar</button>
                </td>
            `;
            productList.appendChild(row);
        });
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const mode = form.dataset.mode;
        
        const name = document.getElementById('product-name').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const stock = parseInt(document.getElementById('product-stock').value);

        if (mode === 'add') {
            const newProduct = { id: nextProductId++, name, price, stock };
            products.push(newProduct);
        } else if (mode === 'edit') {
            const editId = parseInt(form.dataset.editId);
            products = products.map(p => 
                p.id === editId ? { id: editId, name, price, stock } : p
            );
            cancelEdit();
        }

        renderProductList();
        form.reset();
    }

    function handleTableClick(e) {
        const target = e.target;
        const id = parseInt(target.dataset.id);

        if (target.classList.contains('btn-delete')) {
            if (confirm(`¿Seguro que quieres borrar el producto con ID ${id}?`)) {
                products = products.filter(p => p.id !== id);
                renderProductList();
            }
        }

        if (target.classList.contains('btn-edit')) {
            const productToEdit = products.find(p => p.id === id);
            if (!productToEdit) return;

            document.getElementById('product-name').value = productToEdit.name;
            document.getElementById('product-price').value = productToEdit.price;
            document.getElementById('product-stock').value = productToEdit.stock;
            
            const form = document.getElementById('product-form');
            form.dataset.mode = 'edit';
            form.dataset.editId = id;
            document.getElementById('form-submit-btn').textContent = 'Actualizar Producto';
            document.getElementById('form-cancel-btn').style.display = 'inline-block';
            form.scrollIntoView({ behavior: 'smooth' });
        }
    }

    function cancelEdit() {
        const form = document.getElementById('product-form');
        form.reset();
        form.dataset.mode = 'add';
        form.dataset.editId = '';
        document.getElementById('form-submit-btn').textContent = 'Añadir Producto';
        document.getElementById('form-cancel-btn').style.display = 'none';
    }


    // =================================================================
    // --- LÓGICA DE PLUGINS (¡AHORA FUNCIONAL!) ---
    // =================================================================

    function handlePluginClick(e) {
        if (!e.target.dataset.plugin) return;
        e.preventDefault();

        const pluginKey = e.target.dataset.plugin;
        if (pluginKey === 'inventory') return; // Inventario es core, no se toca

        // Simulación de "compra"
        if (pluginState[pluginKey]) {
            alert(`El plugin "${pluginKey}" ya está activo.`);
        } else {
            if (confirm(`¿Deseas comprar y activar el plugin "${pluginKey}"?`)) {
                pluginState[pluginKey] = true; // ¡Activado!
                alert(`¡Plugin "${pluginKey}" activado!`);
                updatePluginButtons(); // Actualiza el botón
                updateNavLinks(); // Actualiza la barra de navegación
            }
        }
    }
    
    function updatePluginButtons() {
        for (const key in pluginState) {
            const btn = document.getElementById(`btn-plugin-${key}`);
            if (btn) {
                if (pluginState[key]) {
                    btn.textContent = 'Activado';
                    btn.disabled = true;
                    if(key !== 'inventory') btn.classList.remove('btn-primary');
                } else {
                    // Texto original (se mantiene)
                }
            }
        }
    }
    
    function updateNavLinks() {
        if (pluginState.reports) {
            navReports.classList.remove('plugin-locked');
            navReports.textContent = '📊 Reportes';
        } else {
            navReports.classList.add('plugin-locked');
            navReports.textContent = '📊 Reportes (Plugin) 🔒';
        }
        // Aquí iría la lógica para otros plugins (ej. CRM)
    }

    // =================================================================
    // --- NUEVAS LÓGICAS (HISTORIAL, REPORTES, CONFIG) ---
    // =================================================================

    // --- Lógica de Historial ---
    function renderHistorialTable() {
        const list = document.getElementById('sales-history-list');
        if (!list) return;
        list.innerHTML = ''; // Limpiar

        // Mostrar las ventas más recientes primero (reverse)
        [...salesHistory].reverse().forEach(sale => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${sale.id}</td>
                <td>${sale.date.toLocaleString()}</td>
                <td>${sale.items.length} (items)</td>
                <td>$${sale.total.toFixed(2)}</td>
                <td>
                    <button class="btn btn-secondary btn-view-details" data-id="${sale.id}">Ver</button>
                </td>
            `;
            list.appendChild(row);
        });
    }

    function handleViewSaleDetails(e) {
        if (!e.target.classList.contains('btn-view-details')) return;
        
        const saleId = parseInt(e.target.dataset.id);
        const sale = salesHistory.find(s => s.id === saleId);
        if (!sale) return;

        const modal = document.getElementById('sale-details-modal');
        const title = document.getElementById('sale-details-title');
        const body = document.getElementById('sale-details-body');

        title.textContent = `Detalle de Venta #${sale.id}`;
        
        let itemsHTML = '<ul>';
        sale.items.forEach(item => {
            itemsHTML += `<li>${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}</li>`;
        });
        itemsHTML += '</ul>';
        
        body.innerHTML = `
            <p><strong>Fecha:</strong> ${sale.date.toLocaleString()}</p>
            <hr>
            ${itemsHTML}
            <hr>
            <p><strong>Subtotal:</strong> $${sale.subtotal.toFixed(2)}</p>
            <p><strong>IVA (${storeSettings.tax}%):</strong> $${sale.tax.toFixed(2)}</p>
            <p><strong>Total:</strong> $${sale.total.toFixed(2)}</p>
        `;
        
        modal.classList.add('show');
    }

    // --- Lógica de Reportes ---
    function renderReportesDashboard() {
        // 1. Ventas Totales
        const totalRevenue = salesHistory.reduce((sum, sale) => sum + sale.total, 0);
        document.getElementById('report-total-revenue').textContent = `$${totalRevenue.toFixed(2)}`;

        // 2. Total de Transacciones
        const totalSales = salesHistory.length;
        document.getElementById('report-total-sales').textContent = totalSales;

        // 3. Ticket Promedio
        const avgTicket = totalSales > 0 ? (totalRevenue / totalSales) : 0;
        document.getElementById('report-avg-ticket').textContent = `$${avgTicket.toFixed(2)}`;

        // 4. Producto Más Vendido (Lógica más compleja)
        const productCounts = {};
        salesHistory.forEach(sale => {
            sale.items.forEach(item => {
                productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
            });
        });
        
        let topProduct = "--";
        let maxQty = 0;
        for (const productName in productCounts) {
            if (productCounts[productName] > maxQty) {
                maxQty = productCounts[productName];
                topProduct = `${productName} (x${maxQty} unidades)`;
            }
        }
        document.getElementById('report-top-product').textContent = topProduct;
    }

    // --- Lógica de Configuración ---
    function handleSettingsSave(e) {
        e.preventDefault();
        
        // Guardar los nuevos valores
        storeSettings.name = document.getElementById('store-name').value;
        storeSettings.currency = document.getElementById('store-currency').value;
        storeSettings.tax = parseFloat(document.getElementById('store-tax').value) || 0;

        // Actualizar UI
        storeNameSidebar.textContent = storeSettings.name;
        
        alert('¡Configuración guardada!');
        console.log("Configuración actualizada:", storeSettings);
    }


    // =================================================================
    // --- NAVEGACIÓN Y INICIALIZACIÓN ---
    // =================================================================

    function setActiveNav(activeLink) {
        // Quitar 'active' de todos
        [navVender, navProducts, navHistorial, navReports, navPlugins, navConfiguracion].forEach(link => {
            if (link) link.classList.remove('active');
        });
        // Poner 'active' solo al clickeado
        if(activeLink) {
            activeLink.classList.add('active');
        }
    }

    navVender.addEventListener('click', (e) => { e.preventDefault(); showVenderView(); });
    navProducts.addEventListener('click', (e) => { e.preventDefault(); showProductsView(); });
    navHistorial.addEventListener('click', (e) => { e.preventDefault(); showHistorialView(); });
    navReports.addEventListener('click', (e) => { e.preventDefault(); showReportesView(); });
    navPlugins.addEventListener('click', (e) => { e.preventDefault(); showPluginsView(); });
    navConfiguracion.addEventListener('click', (e) => { e.preventDefault(); showConfiguracionView(); });

    // --- INICIALIZACIÓN ---
    function init() {
        storeNameSidebar.textContent = storeSettings.name;
        updateNavLinks(); // Sincroniza los plugins bloqueados
        showVenderView(); // Carga la terminal de venta al iniciar
    }
    
    init();
});