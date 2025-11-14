from flask import Flask, render_template, request, jsonify
import re
import random
import time
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
import string
from collections import Counter
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Configuración NLTK
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

app = Flask(__name__)
app.secret_key = 'copyfound_ai_secret_key_2024'

class TextAnalysisAI:
    def __init__(self):
        self.stop_words = set(stopwords.words('spanish'))
        self.synonyms_db = self._build_synonyms_database()
        self.phrase_patterns = self._build_phrase_patterns()
    
    def _build_synonyms_database(self):
        return {
            'constituye': ['representa', 'consiste en', 'equivale a', 'configura'],
            'procedimiento': ['proceso', 'mecanismo', 'método', 'sistema'],
            'plantas': ['vegetales', 'especies vegetales', 'organismos fotosintéticos'],
            'verde': ['clorofílicas', 'fotosintéticas', 'vegetales'],
            'convierten': ['transforman', 'modifican', 'alteran', 'transmutan'],
            'energía': ['potencial energético', 'capacidad energética'],
            'luz': ['luminosa', 'radiación solar', 'energía lumínica'],
            'química': ['químico', 'energético', 'molecular'],
            'emplean': ['utilizan', 'hacen uso de', 'se valen de'],
            'dióxido de carbono': ['CO2', 'anhídrido carbónico', 'gas carbónico'],
            'agua': ['H2O', 'líquido vital', 'recursos hídricos'],
            'generar': ['producir', 'elaborar', 'sintetizar', 'crear'],
            'glucosa': ['azúcar', 'carbohidrato', 'compuesto orgánico'],
            'oxígeno': ['O2', 'elemento gaseoso', 'gas vital'],
            'expulsando': ['liberando', 'emitiendo', 'desprendiendo'],
            'atmósfera': ['aire', 'medio gaseoso', 'entorno atmosférico'],
            'importante': ['crucial', 'fundamental', 'esencial'],
            'grande': ['extenso', 'amplio', 'vasto'],
            'pequeño': ['reducido', 'limitado', 'modesto'],
            'cambio': ['transformación', 'alteración', 'modificación'],
            'climático': ['ambiental', 'ecológico', 'atmosférico'],
            'efecto': ['impacto', 'consecuencia', 'resultado'],
            'aumentar': ['incrementar', 'elevar', 'intensificar'],
            'reducir': ['disminuir', 'minimizar', 'atenuar'],
            'analizar': ['estudiar', 'examinar', 'investigar'],
            'desarrollar': ['elaborar', 'crear', 'producir'],
            'implementar': ['aplicar', 'ejecutar', 'poner en práctica'],
            'mejorar': ['optimizar', 'perfeccionar', 'potenciar']
        }
    
    def _build_phrase_patterns(self):
        return {
            'academic': [
                "Cabe destacar que {}",
                "Es fundamental señalar que {}",
                "Se puede observar cómo {}",
                "Resulta evidente que {}",
                "Conviene resaltar que {}"
            ],
            'simplified': [
                "En pocas palabras, {}",
                "Básicamente, {}",
                "Es decir, {}",
                "En resumen, {}"
            ],
            'formal': [
                "Es preciso mencionar que {}",
                "Conviene indicar que {}",
                "Resulta pertinente señalar que {}"
            ]
        }

    # ASISTENTE DE PARAFRASEO IA
    def ai_paraphrase(self, text, style='academic'):
        """Parafraseo mejorado con IA"""
        if not text.strip():
            return {
                'original': text,
                'paraphrased': text,
                'improvement_score': 0,
                'style_used': style,
                'changes_made': 0
            }
        
        # Simular procesamiento
        time.sleep(1)
        
        sentences = sent_tokenize(text)
        paraphrased_sentences = []
        total_changes = 0
        
        for sentence in sentences:
            words = word_tokenize(sentence)
            new_words = []
            
            for word in words:
                word_lower = word.lower().strip()
                
                if (word_lower in self.synonyms_db and 
                    len(word_lower) > 3 and 
                    word_lower not in self.stop_words and
                    random.random() > 0.5):
                    
                    synonyms = self.synonyms_db[word_lower]
                    new_word = random.choice(synonyms)
                    
                    if word[0].isupper():
                        new_word = new_word.capitalize()
                    
                    new_words.append(new_word)
                    total_changes += 1
                else:
                    new_words.append(word)
            
            new_sentence = ' '.join(new_words)
            
            # Aplicar patrones de estilo
            if style in self.phrase_patterns and random.random() > 0.7:
                pattern = random.choice(self.phrase_patterns[style])
                new_sentence = pattern.format(new_sentence.lower())
            
            new_sentence = self._clean_sentence(new_sentence)
            paraphrased_sentences.append(new_sentence)
        
        final_text = ' '.join(paraphrased_sentences)
        improvement = min(85, total_changes * 10 + random.randint(10, 30))
        
        return {
            'original': text,
            'paraphrased': final_text,
            'improvement_score': improvement,
            'style_used': style,
            'changes_made': total_changes
        }
    
    def _clean_sentence(self, sentence):
        sentence = re.sub(r'\s+', ' ', sentence).strip()
        if sentence and sentence[-1] not in '.!?':
            sentence += '.'
        return sentence

    # CORRECCIÓN ORTOGRÁFICA
    def spell_check(self, text):
        """Corrección ortográfica simulada"""
        time.sleep(0.5)
        
        errors = []
        words = word_tokenize(text)
        
        # Simular detección de errores comunes
        common_errors = {
            'asimismo': 'así mismo',
            'haber': 'a ver',
            'halla': 'haya',
            'echo': 'hecho',
            'hiba': 'iba'
        }
        
        for i, word in enumerate(words):
            word_lower = word.lower()
            if word_lower in common_errors:
                errors.append({
                    'word': word,
                    'suggestion': common_errors[word_lower],
                    'position': i
                })
        
        # Simular errores de puntuación
        if not re.search(r'[.!?]$', text.strip()):
            errors.append({
                'word': 'Puntuación',
                'suggestion': 'Añadir punto final',
                'position': len(words)
            })
        
        readability = max(30, min(95, 100 - len(errors) * 5))
        
        return {
            'total_errors': len(errors),
            'corrections': errors,
            'readability_score': readability
        }

    # ASISTENTE RÁPIDO
    def writing_assistant(self, text):
        """Asistente rápido para mejoras de escritura"""
        time.sleep(0.5)
        
        suggestions = []
        
        # Análisis básico del texto
        sentences = sent_tokenize(text)
        words = word_tokenize(text)
        
        if len(sentences) < 2:
            suggestions.append("💡 Considera añadir más oraciones para desarrollar mejor tus ideas")
        
        if len(words) < 20:
            suggestions.append("📝 El texto es muy corto, podrías expandir tus ideas")
        
        # Sugerencias de estructura
        if not any(word in text.lower() for word in ['sin embargo', 'por otro lado', 'además']):
            suggestions.append("🔄 Añade conectores para mejorar el flujo del texto")
        
        # Sugerencias de vocabulario
        unique_words = len(set(words))
        if unique_words / len(words) < 0.4:
            suggestions.append("🎨 Intenta usar más variedad de palabras para enriquecer el texto")
        
        # Sugerencias de longitud de párrafos
        paragraphs = [p.strip() for p in text.split('\n') if p.strip()]
        for i, para in enumerate(paragraphs):
            para_words = len(word_tokenize(para))
            if para_words > 150:
                suggestions.append(f"📏 El párrafo {i+1} es muy largo, considera dividirlo")
        
        return {
            'suggestions': suggestions[:5],  # Máximo 5 sugerencias
            'total_suggestions': len(suggestions)
        }

    # DETECTOR DE IA
    def detect_ai(self, text):
        """Detección de texto generado por IA"""
        time.sleep(1)
        
        ai_score = 0
        detected_patterns = []
        
        # Patrones típicos de IA
        ai_phrases = [
            "como modelo de lenguaje", "openai", "desarrollado por",
            "no tengo la capacidad de", "hasta mi fecha de corte",
            "como una inteligencia artificial"
        ]
        
        for phrase in ai_phrases:
            if phrase in text.lower():
                ai_score += 0.1
                detected_patterns.append(f"Frase típica de IA: '{phrase}'")
        
        # Análisis de estructura
        sentences = sent_tokenize(text)
        if len(sentences) > 2:
            # Verificar uniformidad en longitud de oraciones
            lengths = [len(word_tokenize(s)) for s in sentences]
            variation = np.std(lengths) / np.mean(lengths) if np.mean(lengths) > 0 else 0
            if variation < 0.3:
                ai_score += 0.2
                detected_patterns.append("Poca variación en longitud de oraciones")
        
        # Verificar uso excesivo de conectores
        connectors = ['además', 'por otro lado', 'sin embargo', 'no obstante', 'en conclusión']
        connector_count = sum(1 for word in word_tokenize(text.lower()) if word in connectors)
        if connector_count / len(sentences) > 0.5:
            ai_score += 0.15
            detected_patterns.append("Uso excesivo de conectores formales")
        
        # Resultado final
        ai_probability = min(0.95, ai_score)
        humanity_score = 1 - ai_probability
        
        return {
            'ai_probability': round(ai_probability, 3),
            'humanity_score': round(humanity_score, 3),
            'detected_patterns': detected_patterns,
            'verdict': "Probablemente IA" if ai_probability > 0.5 else "Probablemente humano"
        }

    # ANÁLISIS DETALLADO POR PÁRRAFO
    def analyze_paragraphs(self, text, reference_texts=None):
        """Análisis detallado por párrafos"""
        time.sleep(1)
        
        paragraphs = [p.strip() for p in text.split('\n') if p.strip()]
        
        if not paragraphs:
            return self._get_empty_analysis()
        
        results = []
        heatmap_data = []
        
        for i, paragraph in enumerate(paragraphs):
            # Simular análisis de similitud
            similarity_score = random.uniform(10, 80)
            
            # Determinar nivel de riesgo
            if similarity_score > 70:
                risk_level = 'crítico'
            elif similarity_score > 50:
                risk_level = 'alto'
            elif similarity_score > 30:
                risk_level = 'moderado'
            else:
                risk_level = 'bajo'
            
            # Generar sugerencias
            suggestions = self._generate_paragraph_suggestions(paragraph, similarity_score)
            
            results.append({
                'paragraph_number': i + 1,
                'text': paragraph[:100] + "..." if len(paragraph) > 100 else paragraph,
                'similarity_score': round(similarity_score, 2),
                'risk_level': risk_level,
                'suggestions': suggestions,
                'word_count': len(word_tokenize(paragraph))
            })
            
            heatmap_data.append({
                'paragraph': i + 1,
                'similarity': round(similarity_score, 2),
                'risk': risk_level
            })
        
        # Calcular métricas generales
        overall_originality = max(0, 100 - sum(p['similarity_score'] for p in results) / len(results))
        academic_risk = self._calculate_academic_risk(results)
        
        return {
            'paragraph_analysis': results,
            'heatmap_data': heatmap_data,
            'academic_risk': academic_risk,
            'overall_originality': round(overall_originality, 2),
            'total_paragraphs': len(paragraphs)
        }
    
    def _get_empty_analysis(self):
        return {
            'paragraph_analysis': [],
            'heatmap_data': [],
            'academic_risk': {'risk_score': 0.0, 'recommendation': '✅ APROBADO'},
            'overall_originality': 100.0,
            'total_paragraphs': 0
        }
    
    def _generate_paragraph_suggestions(self, paragraph, similarity):
        suggestions = []
        
        if similarity > 70:
            suggestions.extend([
                "🔴 RIESGO CRÍTICO - Reescritura completa necesaria",
                "💡 Reformula completamente las ideas principales",
                "📝 Cambia la estructura sintáctica"
            ])
        elif similarity > 50:
            suggestions.extend([
                "🟡 RIESGO ALTO - Reestructuración necesaria",
                "💡 Modifica el orden de las oraciones",
                "🔧 Usa sinónimos para palabras clave"
            ])
        elif similarity > 30:
            suggestions.extend([
                "🟢 RIESGO MODERADO - Parafraseo recomendado",
                "💡 Utiliza el asistente de parafraseo IA",
                "📚 Cambia conectores y expresiones"
            ])
        else:
            suggestions.extend([
                "✅ ORIGINALIDAD ACEPTABLE",
                "💡 Pequeñas mejoras pueden optimizar el texto"
            ])
        
        return suggestions
    
    def _calculate_academic_risk(self, paragraph_analysis):
        if not paragraph_analysis:
            return {'risk_score': 0.0, 'recommendation': '✅ APROBADO'}
        
        high_risk_count = sum(1 for p in paragraph_analysis if p['risk_level'] in ['alto', 'crítico'])
        total_paragraphs = len(paragraph_analysis)
        
        risk_score = min(100, (high_risk_count / total_paragraphs) * 100 + 20)
        
        if risk_score > 70:
            recommendation = "❌ ALTO RIESGO - No aprobaría"
        elif risk_score > 50:
            recommendation = "⚠️ RIESGO MODERADO-ALTO - Revisión urgente"
        elif risk_score > 30:
            recommendation = "🔶 RIESGO MODERADO - Mejoras necesarias"
        else:
            recommendation = "✅ RIESGO BAJO - Aprobable"
        
        return {
            'risk_score': round(risk_score, 2),
            'recommendation': recommendation
        }

# Inicializar sistema
ai_system = TextAnalysisAI()

# Rutas principales
@app.route('/')
def index():
    return render_template('index.html')

# API Routes - CORREGIDAS
@app.route('/paraphrase', methods=['POST'])
def paraphrase():
    try:
        data = request.get_json()
        text = data.get('text', '')
        style = data.get('style', 'academic')
        
        if not text.strip():
            return jsonify({'error': 'Ingresa texto para parafrasear'}), 400
        
        result = ai_system.ai_paraphrase(text, style)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': f'Error en el parafraseo: {str(e)}'}), 500

@app.route('/spell-check', methods=['POST'])
def spell_check():
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text.strip():
            return jsonify({'error': 'Ingresa un texto para corregir'}), 400
        
        results = ai_system.spell_check(text)
        return jsonify(results)
    
    except Exception as e:
        return jsonify({'error': f'Error en corrección ortográfica: {str(e)}'}), 500

@app.route('/writing-assistant', methods=['POST'])
def writing_assistant():
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text.strip():
            return jsonify({'error': 'Ingresa un texto para analizar'}), 400
        
        results = ai_system.writing_assistant(text)
        return jsonify(results)
    
    except Exception as e:
        return jsonify({'error': f'Error en asistente de escritura: {str(e)}'}), 500

@app.route('/detect-ai', methods=['POST'])
def detect_ai():
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text.strip():
            return jsonify({'error': 'Ingresa un texto para analizar'}), 400
        
        results = ai_system.detect_ai(text)
        return jsonify(results)
    
    except Exception as e:
        return jsonify({'error': f'Error en detección de IA: {str(e)}'}), 500

@app.route('/analyze-paragraphs', methods=['POST'])
def analyze_paragraphs():
    try:
        data = request.get_json()
        text = data.get('text', '')
        references = data.get('references', [])
        
        if not text.strip():
            return jsonify({'error': 'Ingresa un texto para analizar'}), 400
        
        results = ai_system.analyze_paragraphs(text, references)
        return jsonify(results)
    
    except Exception as e:
        return jsonify({'error': f'Error en el análisis: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Sistema funcionando correctamente'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)