// Navegación entre secciones
document.addEventListener('DOMContentLoaded', function() {
    // Configurar navegación entre herramientas
    const navButtons = document.querySelectorAll('.nav-btn');
    const toolSections = document.querySelectorAll('.tool-section');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            
            // Actualizar botones activos
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar sección correspondiente
            toolSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // Inicializar con la primera sección activa
    if (toolSections.length > 0) {
        toolSections[0].classList.add('active');
    }
    
    mostrarNotificacion('🚀 Sistema cargado correctamente. Todas las funciones están operativas.');
});

// Función para mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = mensaje;
    notification.className = `notification ${tipo} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Función para mostrar loading
function mostrarLoading(elemento) {
    elemento.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Procesando...</p>
        </div>
    `;
    elemento.classList.remove('has-content');
}

// Función para mostrar resultado
function mostrarResultado(elemento, contenido) {
    elemento.innerHTML = `<div class="result-content">${contenido}</div>`;
    elemento.classList.add('has-content');
}

// Validación de texto
function validarTexto(texto, minPalabras = 5) {
    if (!texto || texto.trim().length === 0) {
        return { valido: false, mensaje: 'El texto no puede estar vacío' };
    }
    
    const palabras = texto.trim().split(/\s+/).filter(palabra => palabra.length > 0);
    if (palabras.length < minPalabras) {
        return { 
            valido: false, 
            mensaje: `El texto debe tener al menos ${minPalabras} palabras` 
        };
    }
    
    return { valido: true, mensaje: '' };
}

// 1. ASISTENTE DE PARAFRASEO IA
async function paraphraseText() {
    const texto = document.getElementById('paraphrase-input').value.trim();
    const estilo = document.getElementById('paraphrase-style').value;
    
    const validacion = validarTexto(texto, 5);
    if (!validacion.valido) {
        mostrarNotificacion(`❌ ${validacion.mensaje}`, 'error');
        return;
    }
    
    const resultadoElemento = document.getElementById('resultado-parafraseo');
    mostrarLoading(resultadoElemento);
    
    // Deshabilitar botón durante el procesamiento
    const boton = document.querySelector('#parafraseo .primary-btn');
    const textoOriginal = boton.innerHTML;
    boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    boton.disabled = true;
    
    try {
        const response = await fetch('/paraphrase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                text: texto,
                style: estilo
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            let contenido = `
                <div class="result-comparison">
                    <div class="original">
                        <h4><i class="fas fa-file-alt"></i> Texto Original</h4>
                        <p>${data.original}</p>
                    </div>
                    <div class="improved">
                        <h4><i class="fas fa-magic"></i> Texto Parafraseado (${data.style_used})</h4>
                        <p>${data.paraphrased}</p>
                    </div>
                </div>
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-value">${data.improvement_score}%</div>
                        <div class="metric-label">Mejora</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${data.changes_made}</div>
                        <div class="metric-label">Cambios</div>
                    </div>
                </div>
            `;
            mostrarResultado(resultadoElemento, contenido);
            mostrarNotificacion('✅ Texto parafraseado exitosamente');
        } else {
            throw new Error(data.error || 'Error desconocido en el servidor');
        }
    } catch (error) {
        console.error('Error en parafraseo:', error);
        mostrarResultado(resultadoElemento, `
            <div style="text-align: center; color: var(--accent-red);">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <h3>Error al parafrasear el texto</h3>
                <p>${error.message}</p>
            </div>
        `);
        mostrarNotificacion('❌ Error en parafraseo: ' + error.message, 'error');
    } finally {
        // Restaurar botón
        boton.innerHTML = textoOriginal;
        boton.disabled = false;
    }
}

// 2. CORRECCIÓN ORTOGRÁFICA
async function corregirOrtografia() {
    const texto = document.getElementById('spell-check-input').value.trim();
    
    const validacion = validarTexto(texto, 3);
    if (!validacion.valido) {
        mostrarNotificacion(`❌ ${validacion.mensaje}`, 'error');
        return;
    }
    
    const resultadoElemento = document.getElementById('resultado-correccion');
    mostrarLoading(resultadoElemento);
    
    const boton = document.querySelector('#correccion .primary-btn');
    const textoOriginal = boton.innerHTML;
    boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Corrigiendo...';
    boton.disabled = true;
    
    try {
        const response = await fetch('/spell-check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: texto })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            let contenido = '';
            
            if (data.total_errors === 0) {
                contenido = `
                    <div style="text-align: center; color: var(--accent-green);">
                        <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                        <h3>¡Texto perfecto! ✅</h3>
                        <p>No se encontraron errores ortográficos o gramaticales.</p>
                        <div class="metric-item" style="display: inline-block; margin-top: 15px;">
                            <div class="metric-value">${data.readability_score}%</div>
                            <div class="metric-label">Legibilidad</div>
                        </div>
                    </div>
                `;
            } else {
                contenido = `
                    <h4><i class="fas fa-exclamation-triangle"></i> Se encontraron ${data.total_errors} errores:</h4>
                    ${data.corrections.map((error, index) => `
                        <div class="error-item">
                            <strong>Error ${index + 1}:</strong> "${error.word}"
                            <br><span style="color: var(--accent-green);"><i class="fas fa-lightbulb"></i> Sugerencia: "${error.suggestion}"</span>
                        </div>
                    `).join('')}
                    <div class="metric-item">
                        <div class="metric-value">${data.readability_score}%</div>
                        <div class="metric-label">Score de Legibilidad</div>
                    </div>
                `;
            }
            
            mostrarResultado(resultadoElemento, contenido);
            mostrarNotificacion('✏️ Corrección completada');
        } else {
            throw new Error(data.error || 'Error desconocido en el servidor');
        }
    } catch (error) {
        console.error('Error en corrección:', error);
        mostrarResultado(resultadoElemento, `
            <div style="text-align: center; color: var(--accent-red);">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <h3>Error al corregir el texto</h3>
                <p>${error.message}</p>
            </div>
        `);
        mostrarNotificacion('❌ Error en corrección: ' + error.message, 'error');
    } finally {
        boton.innerHTML = textoOriginal;
        boton.disabled = false;
    }
}

// 3. ASISTENTE RÁPIDO
async function asistenteRapido() {
    const texto = document.getElementById('quick-assistant-input').value.trim();
    
    const validacion = validarTexto(texto, 5);
    if (!validacion.valido) {
        mostrarNotificacion(`❌ ${validacion.mensaje}`, 'error');
        return;
    }
    
    const resultadoElemento = document.getElementById('resultado-asistente');
    mostrarLoading(resultadoElemento);
    
    const boton = document.querySelector('#asistente .primary-btn');
    const textoOriginal = boton.innerHTML;
    boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analizando...';
    boton.disabled = true;
    
    try {
        const response = await fetch('/writing-assistant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: texto })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            let contenido = '<h4><i class="fas fa-lightbulb"></i> Sugerencias de Mejora:</h4>';
            
            if (data.suggestions.length === 0) {
                contenido += `
                    <div style="text-align: center; color: var(--accent-green);">
                        <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                        <h3>¡Excelente! ✅</h3>
                        <p>Tu texto no necesita mejoras significativas.</p>
                    </div>
                `;
            } else {
                contenido += data.suggestions.map(sugerencia => `
                    <div class="suggestion-item">
                        ${sugerencia}
                    </div>
                `).join('');
            }
            
            contenido += `
                <div class="metric-item">
                    <div class="metric-value">${data.total_suggestions}</div>
                    <div class="metric-label">Sugerencias</div>
                </div>
            `;
            
            mostrarResultado(resultadoElemento, contenido);
            mostrarNotificacion('💡 Sugerencias generadas');
        } else {
            throw new Error(data.error || 'Error desconocido en el servidor');
        }
    } catch (error) {
        console.error('Error en asistente:', error);
        mostrarResultado(resultadoElemento, `
            <div style="text-align: center; color: var(--accent-red);">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <h3>Error al obtener sugerencias</h3>
                <p>${error.message}</p>
            </div>
        `);
        mostrarNotificacion('❌ Error en asistente: ' + error.message, 'error');
    } finally {
        boton.innerHTML = textoOriginal;
        boton.disabled = false;
    }
}

// 4. DETECTOR DE IA
async function detectarIA() {
    const texto = document.getElementById('ai-detector-input').value.trim();
    
    const validacion = validarTexto(texto, 10);
    if (!validacion.valido) {
        mostrarNotificacion(`❌ ${validacion.mensaje}`, 'error');
        return;
    }
    
    const resultadoElemento = document.getElementById('resultado-detector');
    mostrarLoading(resultadoElemento);
    
    const boton = document.querySelector('#detector .primary-btn');
    const textoOriginal = boton.innerHTML;
    boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detectando...';
    boton.disabled = true;
    
    try {
        const response = await fetch('/detect-ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                },
            body: JSON.stringify({ text: texto })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const aiPercent = (data.ai_probability * 100).toFixed(1);
            const humanPercent = (data.humanity_score * 100).toFixed(1);
            
            let contenido = `
                <div class="metric-grid">
                    <div class="metric-item" style="color: ${data.ai_probability > 0.5 ? 'var(--accent-red)' : 'var(--accent-green)'}">
                        <div class="metric-value">${aiPercent}%</div>
                        <div class="metric-label">Probabilidad IA</div>
                    </div>
                    <div class="metric-item" style="color: ${data.ai_probability > 0.5 ? 'var(--accent-green)' : 'var(--accent-red)'}">
                        <div class="metric-value">${humanPercent}%</div>
                        <div class="metric-label">Probabilidad Humano</div>
                    </div>
                </div>
                <div class="suggestion-item" style="text-align: center; font-weight: 600; background: ${data.ai_probability > 0.5 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'}; color: var(--text-primary);">
                    <i class="fas ${data.ai_probability > 0.5 ? 'fa-robot' : 'fa-user'}"></i> Veredicto: ${data.verdict}
                </div>
            `;
            
            if (data.detected_patterns && data.detected_patterns.length > 0) {
                contenido += `
                    <h4 style="margin-top: 20px;"><i class="fas fa-search"></i> Patrones Detectados:</h4>
                    ${data.detected_patterns.map(pattern => `
                        <div class="suggestion-item">
                            ${pattern}
                        </div>
                    `).join('')}
                `;
            }
            
            mostrarResultado(resultadoElemento, contenido);
            mostrarNotificacion('🤖 Análisis de IA completado');
        } else {
            throw new Error(data.error || 'Error desconocido en el servidor');
        }
    } catch (error) {
        console.error('Error en detector:', error);
        mostrarResultado(resultadoElemento, `
            <div style="text-align: center; color: var(--accent-red);">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <h3>Error en detección de IA</h3>
                <p>${error.message}</p>
            </div>
        `);
        mostrarNotificacion('❌ Error en detector: ' + error.message, 'error');
    } finally {
        boton.innerHTML = textoOriginal;
        boton.disabled = false;
    }
}

// 5. ANÁLISIS DETALLADO POR PÁRRAFO
async function analizarParrafos() {
    const texto = document.getElementById('analysis-input').value.trim();
    const referencia = document.getElementById('reference-texts').value;
    
    const validacion = validarTexto(texto, 20);
    if (!validacion.valido) {
        mostrarNotificacion(`❌ ${validacion.mensaje}`, 'error');
        return;
    }
    
    const resultadoElemento = document.getElementById('resultados-analisis');
    mostrarLoading(resultadoElemento);
    
    const boton = document.querySelector('#analisis .primary-btn');
    const textoOriginal = boton.innerHTML;
    boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analizando...';
    boton.disabled = true;
    
    try {
        const response = await fetch('/analyze-paragraphs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                text: texto,
                references: referencia ? referencia.split('---').filter(ref => ref.trim()) : []
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            let contenido = `
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-value">${data.overall_originality}%</div>
                        <div class="metric-label">Originalidad General</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${data.academic_risk.risk_score}%</div>
                        <div class="metric-label">Riesgo Académico</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${data.total_paragraphs}</div>
                        <div class="metric-label">Total Párrafos</div>
                    </div>
                </div>
                <div class="suggestion-item" style="text-align: center; font-weight: 600; background: ${
                    data.academic_risk.risk_score > 70 ? 'rgba(239, 68, 68, 0.1)' : 
                    data.academic_risk.risk_score > 50 ? 'rgba(245, 158, 11, 0.1)' : 
                    data.academic_risk.risk_score > 30 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                }; color: var(--text-primary);">
                    ${data.academic_risk.recommendation}
                </div>
            `;
            
            // Heatmap de similitud
            if (data.heatmap_data && data.heatmap_data.length > 0) {
                contenido += `
                    <h4 style="margin-top: 20px;"><i class="fas fa-map"></i> Mapa de Similitud por Párrafos</h4>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
                        ${data.heatmap_data.map(item => `
                            <div style="padding: 8px 12px; border-radius: 6px; background: ${
                                item.risk === 'crítico' ? 'rgba(239, 68, 68, 0.2)' : 
                                item.risk === 'alto' ? 'rgba(245, 158, 11, 0.2)' : 
                                item.risk === 'moderado' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)'
                            }; border: 1px solid ${
                                item.risk === 'crítico' ? 'var(--accent-red)' : 
                                item.risk === 'alto' ? 'var(--accent-orange)' : 
                                item.risk === 'moderado' ? 'var(--accent-green)' : 'var(--accent-blue)'
                            }; color: var(--text-primary);">
                                <strong>P${item.paragraph}</strong>: ${item.similarity}%
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            // Análisis por párrafo
            if (data.paragraph_analysis && data.paragraph_analysis.length > 0) {
                contenido += '<h4><i class="fas fa-chart-bar"></i> Análisis por Párrafo:</h4>';
                data.paragraph_analysis.forEach(parrafo => {
                    contenido += `
                        <div class="paragraph-result">
                            <div class="paragraph-header">
                                <h5>Párrafo ${parrafo.paragraph_number}</h5>
                                <span class="risk-badge risk-${parrafo.risk_level}">${parrafo.risk_level.toUpperCase()}</span>
                            </div>
                            <p style="color: var(--text-muted); font-style: italic; margin-bottom: 10px;">"${parrafo.text}"</p>
                            <div class="metric-grid" style="grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-bottom: 10px;">
                                <div class="metric-item">
                                    <div class="metric-value">${parrafo.similarity_score}%</div>
                                    <div class="metric-label">Similitud</div>
                                </div>
                                <div class="metric-item">
                                    <div class="metric-value">${parrafo.word_count}</div>
                                    <div class="metric-label">Palabras</div>
                                </div>
                            </div>
                            <div>
                                ${parrafo.suggestions.map(sug => `
                                    <div class="suggestion-item" style="margin-bottom: 5px; padding: 10px;">
                                        ${sug}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                });
            } else {
                contenido += `
                    <div style="text-align: center; color: var(--text-muted); padding: 40px 20px;">
                        <i class="fas fa-info-circle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                        <h3>No se encontraron párrafos para analizar</h3>
                        <p>Asegúrate de que el texto contenga párrafos separados por saltos de línea.</p>
                    </div>
                `;
            }
            
            mostrarResultado(resultadoElemento, contenido);
            mostrarNotificacion('📊 Análisis de párrafos completado');
        } else {
            throw new Error(data.error || 'Error desconocido en el servidor');
        }
    } catch (error) {
        console.error('Error en análisis:', error);
        mostrarResultado(resultadoElemento, `
            <div style="text-align: center; color: var(--accent-red);">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <h3>Error al analizar los párrafos</h3>
                <p>${error.message}</p>
            </div>
        `);
        mostrarNotificacion('❌ Error en análisis: ' + error.message, 'error');
    } finally {
        boton.innerHTML = textoOriginal;
        boton.disabled = false;
    }
}