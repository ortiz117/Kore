  // Espera a que el DOM esté completamente cargado
        document.addEventListener('DOMContentLoaded', () => {

            // --- ESTADO GLOBAL ---
            let storeSettings = {
                name: "Kore POS",
                currency: "MXN",
                tax: 16
            };

            let products = [
                { id: 1, name: "Pizza Margarita", price: 120.50, stock: 30, category: "Comida" },
                { id: 2, name: "Refresco Grande", price: 35.00, stock: 50, category: "Bebidas" },
                { id: 3, name: "Papas Fritas", price: 45.00, stock: 15, category: "Comida" },
                { id: 4, name: "Hamburguesa Clásica", price: 80.00, stock: 0, category: "Comida" },
                { id: 5, name: "Ensalada César", price: 65.00, stock: 20, category: "Comida" },
                { id: 6, name: "Agua Mineral", price: 25.00, stock: 40, category: "Bebidas" }
            ];
            let nextProductId = 7;
            
            let pluginState = {
                reports: false,
                inventory: true,
                crm: false
            };

            let currentSale = [];
            let salesHistory = [];
            let nextSaleId = 1;

            // Referencias DOM
            const mainContent = document.getElementById('main-content');
            const navVender = document.getElementById('nav-vender');
            const navProducts = document.getElementById('nav-products');
            const navHistorial = document.getElementById('nav-historial');
            const navReports = document.getElementById('nav-reports');
            const navPlugins = document.getElementById('nav-plugins');
            const navConfiguracion = document.getElementById('nav-configuracion');
            const storeNameSidebar = document.getElementById('store-name-sidebar');

            // --- SISTEMA DE NOTIFICACIONES TOAST ---
            function showToast(message, type = 'success') {
                const toast = document.getElementById('toast');
                const toastMessage = document.getElementById('toast-message');
                
                toast.className = `toast ${type} show`;
                toastMessage.textContent = message;
                
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3000);
            }

            // --- PLANTILLAS HTML ---
            const venderViewHTML = `
                <div class="pos-layout">
                    <div class="pos-products">
                        <h2>🛍️ Seleccionar Productos</h2>
                        <div class="pos-search">
                            <input type="text" id="pos-search-input" placeholder="🔍 Buscar productos...">
                        </div>
                        <div class="pos-products-grid" id="pos-products-grid"></div>
                    </div>
                    <div class="pos-ticket">
                        <h2>🧾 Ticket de Venta</h2>
                        <ul class="pos-ticket-items" id="pos-ticket-items"></ul>
                        <div class="pos-total">
                            <p><span>Subtotal:</span> <span id="pos-subtotal">$0.00</span></p>
                            <p><span>IVA (${storeSettings.tax}%):</span> <span id="pos-tax">$0.00</span></p>
                            <h2 class="total-final"><span>Total:</span> <span id="pos-total-amount">$0.00</span></h2>
                        </div>
                        <div class="pos-actions">
                            <button class="btn btn-danger" id="btn-cancel-sale">❌ Cancelar</button>
                            <button class="btn btn-primary" id="btn-checkout">💰 Cobrar</button>
                        </div>
                    </div>
                </div>
            `;

            const productsViewHTML = `
                <h1>📦 Gestión de Productos</h1>
                <div class="card">
                    <h2>➕ Añadir / Editar Producto</h2>
                    <form id="product-form" data-mode="add" data-edit-id="">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="product-name">Nombre del Producto</label>
                                <input type="text" id="product-name" placeholder="Ej: Pizza Hawaiana" required>
                            </div>
                            <div class="form-group">
                                <label for="product-price">Precio (Sin IVA)</label>
                                <input type="number" id="product-price" step="0.01" min="0" placeholder="0.00" required>
                            </div>
                            <div class="form-group">
                                <label for="product-stock">Stock Disponible</label>
                                <input type="number" id="product-stock" min="0" placeholder="0" required>
                            </div>
                            <div class="form-group">
                                <label for="product-category">Categoría</label>
                                <input type="text" id="product-category" placeholder="Ej: Bebidas" required>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary" id="form-submit-btn">✅ Añadir Producto</button>
                        <button type="button" class="btn btn-secondary" id="form-cancel-btn" style="display: none;">❌ Cancelar Edición</button>
                    </form>
                </div>
                <div class="card">
                    <h2>📋 Lista de Productos</h2>
                    <table class="product-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Categoría</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="product-list"></tbody>
                    </table>
                </div>
            `;

            const pluginsViewHTML = `
                <h1>🔌 Tienda de Plugins</h1>
                <p style="color: #7f8c8d; margin-bottom: 30px;">Expande las capacidades de tu sistema POS con módulos profesionales.</p>
                <div class="plugin-grid">
                    <div class="plugin-card">
                        <h3>📊 Inventario Avanzado</h3>
                        <p>Control total de stock con alertas automáticas, gestión de lotes y multi-almacén.</p>
                        <button class="btn" data-plugin="inventory" id="btn-plugin-inventory" disabled>✅ Activado (Core)</button>
                    </div>
                    <div class="plugin-card">
                        <h3>📈 Reportes Financieros</h3>
                        <p>Análisis profundo de ventas, ganancias, proyecciones y gráficas interactivas en tiempo real.</p>
                        <button class="btn btn-primary" data-plugin="reports" id="btn-plugin-reports">
                            🚀 Activar por $199/mes
                        </button>
                    </div>
                    <div class="plugin-card">
                        <h3>👥 CRM y Lealtad</h3>
                        <p>Base de datos inteligente de clientes, programa de puntos y marketing automatizado.</p>
                        <button class="btn btn-primary" data-plugin="crm" id="btn-plugin-crm">
                            🚀 Activar por $149/mes
                        </button>
                    </div>
                </div>
            `;

            const historialViewHTML = `
                <h1>🧾 Historial de Ventas</h1>
                <div class="card">
                    <table class="sales-history-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Fecha y Hora</th>
                                <th>Artículos</th>
                                <th>Total</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="sales-history-list"></tbody>
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

            const reportesViewHTML = `
                <h1>📊 Reportes y Analítica</h1>
                <div class="reports-grid">
                    <div class="report-card">
                        <h3>💰 Ingresos Totales</h3>
                        <div class="value" id="report-total-revenue">$0.00</div>
                    </div>
                    <div class="report-card">
                        <h3>🛒 Transacciones</h3>
                        <div class="value" id="report-total-sales">0</div>
                    </div>
                    <div class="report-card">
                        <h3>📊 Ticket Promedio</h3>
                        <div class="value" id="report-avg-ticket">$0.00</div>
                    </div>
                    <div class="report-card">
                        <h3>🏆 Productos Vendidos</h3>
                        <div class="value" id="report-total-items">0</div>
                    </div>
                </div>
                <div class="card">
                    <h2>🥇 Producto Más Vendido</h2>
                    <h3 id="report-top-product" style="color: #1abc9c; font-size: 1.8em;">--</h3>
                </div>
            `;

            const configuracionViewHTML = `
                <h1>⚙️ Configuración de la Tienda</h1>
                <div class="card">
                    <h2>🏪 Información General</h2>
                    <form id="settings-form">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="store-name">Nombre de la Tienda</label>
                                <input type="text" id="store-name" placeholder="Mi Negocio" required>
                            </div>
                            <div class="form-group">
                                <label for="store-currency">Moneda</label>
                                <input type="text" id="store-currency" placeholder="MXN, USD, EUR..." required>
                            </div>
                            <div class="form-group">
                                <label for="store-tax">Impuesto (% IVA)</label>
                                <input type="number" id="store-tax" min="0" max="100" step="1" placeholder="16">
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">💾 Guardar Cambios</button>
                    </form>
                </div>
            `;

            // --- FUNCIONES DE RENDERIZADO ---
            function showVenderView() {
                mainContent.innerHTML = venderViewHTML;
                setActiveNav(navVender);
                renderPOSProductGrid();
                renderPOSTicket();

                document.getElementById('pos-products-grid').addEventListener('click', handlePOSProductClick);
                document.getElementById('pos-ticket-items').addEventListener('click', handlePOSTicketClick);
                document.getElementById('btn-cancel-sale').addEventListener('click', cancelSale);
                document.getElementById('btn-checkout').addEventListener('click', handleCheckout);
                document.getElementById('pos-search-input').addEventListener('input', handlePOSSearch);
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
                updatePluginButtons();
            }

            function showHistorialView() {
                mainContent.innerHTML = historialViewHTML;
                setActiveNav(navHistorial);
                renderHistorialTable();

                document.getElementById('close-details-modal-btn').addEventListener('click', () => {
                    document.getElementById('sale-details-modal').classList.remove('show');
                });
                document.getElementById('sales-history-list').addEventListener('click', handleViewSaleDetails);
            }

            function showReportesView() {
                if (!pluginState.reports) {
                    showToast('⚠️ Debes activar el plugin de Reportes primero', 'warning');
                    showPluginsView();
                    return;
                }

                mainContent.innerHTML = reportesViewHTML;
                setActiveNav(navReports);
                renderReportesDashboard();
            }

            function showConfiguracionView() {
                mainContent.innerHTML = configuracionViewHTML;
                setActiveNav(navConfiguracion);

                document.getElementById('store-name').value = storeSettings.name;
                document.getElementById('store-currency').value = storeSettings.currency;
                document.getElementById('store-tax').value = storeSettings.tax;
                
                document.getElementById('settings-form').addEventListener('submit', handleSettingsSave);
            }

            // --- LÓGICA TERMINAL POS ---
            function renderPOSProductGrid(searchTerm = '') {
                const grid = document.getElementById('pos-products-grid');
                if (!grid) return;
                grid.innerHTML = '';
                
                const filteredProducts = products.filter(p => 
                    p.name.toLowerCase().includes(searchTerm.toLowerCase())
                );

                if (filteredProducts.length === 0) {
                    grid.innerHTML = '<div class="empty-state"><h3>No se encontraron productos</h3><p>Intenta con otra búsqueda</p></div>';
                    return;
                }
                
                filteredProducts.forEach(product => {
                    const card = document.createElement('div');
                    card.className = 'pos-product-card';
                    card.dataset.id = product.id;
                    
                    if (product.stock <= 0) card.classList.add('out-of-stock');

                    card.innerHTML = `
                        <h4>${product.name}</h4>
                        <div class="price">${product.price.toFixed(2)}</div>
                        <div class="stock">Stock: ${product.stock}</div>
                    `;
                    grid.appendChild(card);
                });
            }

            function handlePOSSearch(e) {
                renderPOSProductGrid(e.target.value);
            }

            function renderPOSTicket() {
                const ticketItems = document.getElementById('pos-ticket-items');
                if (!ticketItems) return;
                ticketItems.innerHTML = '';
                
                if (currentSale.length === 0) {
                    ticketItems.innerHTML = '<div class="empty-state"><p>🛒 Carrito vacío</p></div>';
                }

                let subtotal = 0;

                currentSale.forEach(item => {
                    const li = document.createElement('li');
                    li.className = 'pos-ticket-item';
                    const itemTotal = item.price * item.quantity;
                    subtotal += itemTotal;

                    li.innerHTML = `
                        <span class="name">${item.name}</span>
                        <span class="qty">x${item.quantity}</span>
                        <span class="price">${itemTotal.toFixed(2)}</span>
                        <span class="remove" data-id="${item.productId}">✕</span>
                    `;
                    ticketItems.appendChild(li);
                });

                const taxAmount = subtotal * (storeSettings.tax / 100);
                const total = subtotal + taxAmount;

                document.getElementById('pos-subtotal').textContent = `${subtotal.toFixed(2)}`;
                document.getElementById('pos-tax').textContent = `${taxAmount.toFixed(2)}`;
                document.getElementById('pos-total-amount').textContent = `${total.toFixed(2)}`;
            }

            function handlePOSProductClick(e) {
                const card = e.target.closest('.pos-product-card');
                if (!card) return;

                const productId = parseInt(card.dataset.id);
                const product = products.find(p => p.id === productId);

                if (product.stock <= 0) {
                    showToast('❌ Producto agotado', 'error');
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
                    showToast('⚠️ No hay más stock disponible', 'warning');
                    return;
                }

                if (existingItem) {
                    existingItem.quantity++;
                } else {
                    currentSale.push({
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: 1
                    });
                }
                renderPOSTicket();
                showToast(`✅ ${product.name} agregado`, 'success');
            }

            function handlePOSTicketClick(e) {
                if (!e.target.classList.contains('remove')) return;
                const productId = parseInt(e.target.dataset.id);
                
                const itemIndex = currentSale.findIndex(item => item.productId === productId);
                if (itemIndex === -1) return;

                const productName = currentSale[itemIndex].name;

                if (currentSale[itemIndex].quantity > 1) {
                    currentSale[itemIndex].quantity--;
                } else {
                    currentSale.splice(itemIndex, 1);
                }
                renderPOSTicket();
                showToast(`➖ ${productName} removido`, 'warning');
            }

            function cancelSale() {
                if (currentSale.length > 0 && confirm('¿Cancelar la venta actual?')) {
                    currentSale = [];
                    renderPOSTicket();
                    showToast('🗑️ Venta cancelada', 'warning');
                }
            }

            function handleCheckout() {
                if (currentSale.length === 0) {
                    showToast('⚠️ El ticket está vacío', 'warning');
                    return;
                }

                const subtotal = currentSale.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const taxAmount = subtotal * (storeSettings.tax / 100);
                const total = subtotal + taxAmount;
                
                if (confirm(`💰 Total a cobrar: ${total.toFixed(2)}\n\n¿Confirmar venta?`)) {
                    
                    const saleRecord = {
                        id: nextSaleId++,
                        date: new Date(),
                        items: [...currentSale],
                        subtotal: subtotal,
                        tax: taxAmount,
                        total: total
                    };
                    salesHistory.push(saleRecord);

                    currentSale.forEach(saleItem => {
                        const productInStock = products.find(p => p.id === saleItem.productId);
                        if (productInStock) {
                            productInStock.stock -= saleItem.quantity;
                        }
                    });

                    showToast('🎉 ¡Venta realizada con éxito!', 'success');
                    
                    currentSale = [];
                    renderPOSTicket();
                    renderPOSProductGrid();
                }
            }

            // --- CRUD PRODUCTOS ---
            function renderProductList() {
                const productList = document.getElementById('product-list');
                if (!productList) return;
                productList.innerHTML = '';
                
                if (products.length === 0) {
                    productList.innerHTML = '<tr><td colspan="6" class="empty-state"><p>No hay productos registrados</p></td></tr>';
                    return;
                }

                products.forEach(product => {
                    const row = document.createElement('tr');
                    const stockClass = product.stock === 0 ? 'style="color: #e74c3c; font-weight: bold;"' : '';
                    row.innerHTML = `
                        <td>#${product.id}</td>
                        <td>${product.name}</td>
                        <td>${product.category || 'N/A'}</td>
                        <td>${product.price.toFixed(2)}</td>
                        <td ${stockClass}>${product.stock} ${product.stock === 0 ? '❌' : '✅'}</td>
                        <td class="actions">
                            <button class="btn btn-secondary btn-edit" data-id="${product.id}">✏️ Editar</button>
                            <button class="btn btn-danger btn-delete" data-id="${product.id}">🗑️ Borrar</button>
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
                const category = document.getElementById('product-category').value;

                if (mode === 'add') {
                    const newProduct = { id: nextProductId++, name, price, stock, category };
                    products.push(newProduct);
                    showToast(`✅ Producto "${name}" añadido`, 'success');
                } else if (mode === 'edit') {
                    const editId = parseInt(form.dataset.editId);
                    const index = products.findIndex(p => p.id === editId);
                    if (index !== -1) {
                        products[index] = { id: editId, name, price, stock, category };
                        showToast(`✅ Producto "${name}" actualizado`, 'success');
                    }
                    cancelEdit();
                }

                renderProductList();
                form.reset();
            }

            function handleTableClick(e) {
                const target = e.target.closest('button');
                if (!target) return;

                const id = parseInt(target.dataset.id);

                if (target.classList.contains('btn-delete')) {
                    const product = products.find(p => p.id === id);
                    if (confirm(`¿Eliminar "${product.name}"?`)) {
                        products = products.filter(p => p.id !== id);
                        renderProductList();
                        showToast('🗑️ Producto eliminado', 'success');
                    }
                }

                if (target.classList.contains('btn-edit')) {
                    const productToEdit = products.find(p => p.id === id);
                    if (!productToEdit) return;

                    document.getElementById('product-name').value = productToEdit.name;
                    document.getElementById('product-price').value = productToEdit.price;
                    document.getElementById('product-stock').value = productToEdit.stock;
                    document.getElementById('product-category').value = productToEdit.category || '';
                    
                    const form = document.getElementById('product-form');
                    form.dataset.mode = 'edit';
                    form.dataset.editId = id;
                    document.getElementById('form-submit-btn').textContent = '💾 Actualizar Producto';
                    document.getElementById('form-cancel-btn').style.display = 'inline-block';
                    form.scrollIntoView({ behavior: 'smooth' });
                }
            }

            function cancelEdit() {
                const form = document.getElementById('product-form');
                form.reset();
                form.dataset.mode = 'add';
                form.dataset.editId = '';
                document.getElementById('form-submit-btn').textContent = '✅ Añadir Producto';
                document.getElementById('form-cancel-btn').style.display = 'none';
            }

            // --- PLUGINS ---
            function handlePluginClick(e) {
                const btn = e.target.closest('button');
                if (!btn || !btn.dataset.plugin) return;
                e.preventDefault();

                const pluginKey = btn.dataset.plugin;
                if (pluginKey === 'inventory') return;

                if (pluginState[pluginKey]) {
                    showToast(`ℹ️ Plugin "${pluginKey}" ya está activo`, 'warning');
                } else {
                    if (confirm(`🚀 ¿Activar el plugin "${pluginKey}"?`)) {
                        pluginState[pluginKey] = true;
                        showToast(`✅ ¡Plugin "${pluginKey}" activado!`, 'success');
                        updatePluginButtons();
                        updateNavLinks();
                    }
                }
            }
            
            function updatePluginButtons() {
                for (const key in pluginState) {
                    const btn = document.getElementById(`btn-plugin-${key}`);
                    if (btn) {
                        if (pluginState[key]) {
                            btn.textContent = '✅ Activado';
                            btn.disabled = true;
                            btn.classList.remove('btn-primary');
                        }
                    }
                }
            }
            
            function updateNavLinks() {
                if (pluginState.reports) {
                    navReports.classList.remove('plugin-locked');
                    navReports.innerHTML = '<span>📊 Reportes</span>';
                } else {
                    navReports.classList.add('plugin-locked');
                    navReports.innerHTML = '<span>📊 Reportes 🔒</span>';
                }
            }

            // --- HISTORIAL ---
            function renderHistorialTable() {
                const list = document.getElementById('sales-history-list');
                if (!list) return;
                list.innerHTML = '';

                if (salesHistory.length === 0) {
                    list.innerHTML = '<tr><td colspan="5" class="empty-state"><h3>📭 No hay ventas registradas</h3><p>Las ventas aparecerán aquí</p></td></tr>';
                    return;
                }

                [...salesHistory].reverse().forEach(sale => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><strong>#${sale.id}</strong></td>
                        <td>${sale.date.toLocaleString('es-MX')}</td>
                        <td>${sale.items.length} artículo(s)</td>
                        <td style="color: #1abc9c; font-weight: bold;">${sale.total.toFixed(2)}</td>
                        <td>
                            <button class="btn btn-secondary btn-view-details" data-id="${sale.id}">👁️ Ver</button>
                        </td>
                    `;
                    list.appendChild(row);
                });
            }

            function handleViewSaleDetails(e) {
                const btn = e.target.closest('.btn-view-details');
                if (!btn) return;
                
                const saleId = parseInt(btn.dataset.id);
                const sale = salesHistory.find(s => s.id === saleId);
                if (!sale) return;

                const modal = document.getElementById('sale-details-modal');
                const title = document.getElementById('sale-details-title');
                const body = document.getElementById('sale-details-body');

                title.textContent = `🧾 Venta #${sale.id}`;
                
                let itemsHTML = '<ul style="list-style: none; padding: 0;">';
                sale.items.forEach(item => {
                    itemsHTML += `<li style="padding: 10px; border-bottom: 1px solid #f0f0f0;">
                        <strong>${item.name}</strong> (x${item.quantity}) - ${(item.price * item.quantity).toFixed(2)}
                    </li>`;
                });
                itemsHTML += '</ul>';
                
                body.innerHTML = `
                    <p><strong>📅 Fecha:</strong> ${sale.date.toLocaleString('es-MX')}</p>
                    <hr style="margin: 15px 0; border: none; border-top: 1px solid #e0e0e0;">
                    <h4 style="margin-bottom: 10px;">Artículos:</h4>
                    ${itemsHTML}
                    <hr style="margin: 15px 0; border: none; border-top: 1px solid #e0e0e0;">
                    <p style="font-size: 1.1em;"><strong>Subtotal:</strong> ${sale.subtotal.toFixed(2)}</p>
                    <p style="font-size: 1.1em;"><strong>IVA (${storeSettings.tax}%):</strong> ${sale.tax.toFixed(2)}</p>
                    <p style="font-size: 1.4em; color: #1abc9c;"><strong>💰 Total:</strong> ${sale.total.toFixed(2)}</p>
                `;
                
                modal.classList.add('show');
            }

            // --- REPORTES ---
            function renderReportesDashboard() {
                const totalRevenue = salesHistory.reduce((sum, sale) => sum + sale.total, 0);
                document.getElementById('report-total-revenue').textContent = `${totalRevenue.toFixed(2)}`;

                const totalSales = salesHistory.length;
                document.getElementById('report-total-sales').textContent = totalSales;

                const avgTicket = totalSales > 0 ? (totalRevenue / totalSales) : 0;
                document.getElementById('report-avg-ticket').textContent = `${avgTicket.toFixed(2)}`;

                const totalItems = salesHistory.reduce((sum, sale) => {
                    return sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
                }, 0);
                document.getElementById('report-total-items').textContent = totalItems;

                const productCounts = {};
                salesHistory.forEach(sale => {
                    sale.items.forEach(item => {
                        productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
                    });
                });
                
                let topProduct = "Sin datos";
                let maxQty = 0;
                for (const productName in productCounts) {
                    if (productCounts[productName] > maxQty) {
                        maxQty = productCounts[productName];
                        topProduct = `${productName} (${maxQty} unidades)`;
                    }
                }
                document.getElementById('report-top-product').textContent = topProduct;
            }

            // --- CONFIGURACIÓN ---
            function handleSettingsSave(e) {
                e.preventDefault();
                
                storeSettings.name = document.getElementById('store-name').value;
                storeSettings.currency = document.getElementById('store-currency').value;
                storeSettings.tax = parseFloat(document.getElementById('store-tax').value) || 0;

                storeNameSidebar.textContent = storeSettings.name;
                
                showToast('💾 Configuración guardada correctamente', 'success');
            }

            // --- NAVEGACIÓN ---
            function setActiveNav(activeLink) {
                [navVender, navProducts, navHistorial, navReports, navPlugins, navConfiguracion].forEach(link => {
                    if (link) link.classList.remove('active');
                });
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
                updateNavLinks();
                showVenderView();
                showToast('✨ ¡Bienvenido a Kore POS!', 'success');
            }
            
            init();
        });