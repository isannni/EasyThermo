// Temperature Converter App
class TemperatureConverter {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('tempHistory') || '[]');
        this.editingId = null;
        this.initializeElements();
        this.bindEvents();
        this.loadHistory();
        this.setupInitialState();
    }

    initializeElements() {
        this.inputTemp = document.getElementById('inputTemp');
        this.fromUnit = document.getElementById('fromUnit');
        this.toUnit = document.getElementById('toUnit');
        this.convertBtn = document.getElementById('convertBtn');
        this.swapUnits = document.getElementById('swapUnits');
        this.resultSection = document.getElementById('resultSection');
        this.tempFrom = document.getElementById('tempFrom');
        this.tempTo = document.getElementById('tempTo');
        this.unitFrom = document.getElementById('unitFrom');
        this.unitTo = document.getElementById('unitTo');
        this.scaleIndicator = document.getElementById('scaleIndicator');
        this.toggleHistory = document.getElementById('toggleHistory');
        this.historyContent = document.getElementById('historyContent');
        this.historyList = document.getElementById('historyList');
        this.clearAllBtn = document.getElementById('clearAllBtn');
    }

    bindEvents() {
        this.convertBtn.addEventListener('click', () => this.convertTemperature());
        this.swapUnits.addEventListener('click', () => this.swapUnitsAction());
        this.toggleHistory.addEventListener('click', () => this.toggleHistoryDisplay());
        this.clearAllBtn.addEventListener('click', () => this.clearAllHistory());
        this.inputTemp.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.convertTemperature();
        });
    }

    setupInitialState() {
        // Sembunyikan riwayat dan hasil konversi di awal
        this.historyContent.style.display = 'none';
        this.resultSection.style.display = 'none';
        
        // Atur teks awal untuk tombol
        const toggleText = this.toggleHistory.querySelector('span');
        toggleText.textContent = 'Tampilkan';
        
        // Sembunyikan tombol hapus semua jika tidak ada riwayat
        this.clearAllBtn.style.display = 'none';
    }

    convertTemperature() {
        const tempValue = parseFloat(this.inputTemp.value);
        
        if (!this.inputTemp.value || isNaN(tempValue)) {
            this.showNotification('Masukkan angka yang valid!', 'error');
            return;
        }

        const result = this.calculateConversion(tempValue, this.fromUnit.value, this.toUnit.value);
        this.displayResult(tempValue, result);
        this.saveToHistory(tempValue, this.fromUnit.value, this.toUnit.value, result);
        this.updateScaleIndicator(result, this.toUnit.value);
    }

    calculateConversion(temp, from, to) {
        let celsius;
        switch (from) {
            case 'celsius': celsius = temp; break;
            case 'fahrenheit': celsius = (temp - 32) * 5/9; break;
            case 'kelvin': celsius = temp - 273.15; break;
            case 'rankine': celsius = (temp - 491.67) * 5/9; break;
            default: celsius = temp;
        }

        switch (to) {
            case 'celsius': return celsius;
            case 'fahrenheit': return (celsius * 9/5) + 32;
            case 'kelvin': return celsius + 273.15;
            case 'rankine': return (celsius * 9/5) + 491.67;
            default: return celsius;
        }
    }

    displayResult(input, result) {
        this.tempFrom.textContent = input.toFixed(2);
        this.tempTo.textContent = result.toFixed(2);
        this.unitFrom.textContent = this.getUnitSymbol(this.fromUnit.value);
        this.unitTo.textContent = this.getUnitSymbol(this.toUnit.value);

        this.tempFrom.style.color = this.getTemperatureColor(input, this.fromUnit.value);
        this.tempTo.style.color = this.getTemperatureColor(result, this.toUnit.value);

        this.resultSection.style.display = 'block';
    }

    updateScaleIndicator(temp, unit) {
        const celsius = unit === 'celsius' ? temp : this.calculateConversion(temp, unit, 'celsius');
        const position = Math.max(0, Math.min(100, (celsius + 50) / 150 * 100));
        this.scaleIndicator.style.left = `calc(${position}% - 8px)`; // Menyesuaikan posisi
    }

    getTemperatureColor(temp, unit) {
        const celsius = unit === 'celsius' ? temp : this.calculateConversion(temp, unit, 'celsius');
        
        if (celsius < -20) return '#3b82f6';
        if (celsius < 0) return '#06b6d4';
        if (celsius < 10) return '#22d3ee';
        if (celsius < 25) return '#4ecdc4';
        if (celsius < 35) return '#f59e0b';
        if (celsius < 50) return '#f97316';
        return '#ef4444';
    }

    getUnitSymbol(unit) {
        const symbols = {
            'celsius': '°C',
            'fahrenheit': '°F',
            'kelvin': 'K',
            'rankine': '°R'
        };
        return symbols[unit] || '';
    }

    swapUnitsAction() {
        const fromValue = this.fromUnit.value;
        this.fromUnit.value = this.toUnit.value;
        this.toUnit.value = fromValue;
        
        if (this.resultSection.style.display === 'block') {
            const currentResult = parseFloat(this.tempTo.textContent);
            this.inputTemp.value = currentResult.toFixed(2);
            this.convertTemperature();
        }
    }

    saveToHistory(input, fromUnit, toUnit, result) {
        const entry = {
            id: Date.now(),
            input: input,
            fromUnit: fromUnit,
            toUnit: toUnit,
            result: result,
            timestamp: new Date().toLocaleString('id-ID')
        };
        this.history.unshift(entry);
        localStorage.setItem('tempHistory', JSON.stringify(this.history));
        this.loadHistory();
    }

    loadHistory() {
        this.historyList.innerHTML = ''; // Kosongkan daftar
        if (this.history.length === 0) {
            this.historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-inbox"></i>
                    <p>Belum ada riwayat konversi</p>
                </div>
            `;
            this.clearAllBtn.style.display = 'none';
        } else {
            this.history.forEach(entry => {
                const item = this.editingId === entry.id ? this.createEditForm(entry) : this.createHistoryItem(entry);
                this.historyList.insertAdjacentHTML('beforeend', item);
            });
            this.clearAllBtn.style.display = 'flex';
        }
    }

    createHistoryItem(entry) {
        return `
            <div class="history-item">
                <div class="history-item-content">
                    <div class="history-conversion">
                        <span style="color: ${this.getTemperatureColor(entry.input, entry.fromUnit)}">
                            ${entry.input} ${this.getUnitSymbol(entry.fromUnit)}
                        </span>
                        →
                        <span style="color: ${this.getTemperatureColor(entry.result, entry.toUnit)}">
                            ${entry.result.toFixed(2)} ${this.getUnitSymbol(entry.toUnit)}
                        </span>
                    </div>
                    <div class="history-actions">
                        <button class="history-btn" onclick="app.editEntry(${entry.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="history-btn" onclick="app.deleteEntry(${entry.id})" title="Hapus">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="history-timestamp">${entry.timestamp}</div>
            </div>
        `;
    }

    createEditForm(entry) {
        return `
            <div class="history-item">
                <div class="edit-form-container">
                    <input type="number" id="edit-input-${entry.id}" value="${entry.input}">
                    <div class="edit-unit-selectors">
                        <select id="edit-from-${entry.id}">
                            <option value="celsius" ${entry.fromUnit === 'celsius' ? 'selected' : ''}>°C</option>
                            <option value="fahrenheit" ${entry.fromUnit === 'fahrenheit' ? 'selected' : ''}>°F</option>
                            <option value="kelvin" ${entry.fromUnit === 'kelvin' ? 'selected' : ''}>K</option>
                            <option value="rankine" ${entry.fromUnit === 'rankine' ? 'selected' : ''}>°R</option>
                        </select>
                        <select id="edit-to-${entry.id}">
                            <option value="celsius" ${entry.toUnit === 'celsius' ? 'selected' : ''}>°C</option>
                            <option value="fahrenheit" ${entry.toUnit === 'fahrenheit' ? 'selected' : ''}>°F</option>
                            <option value="kelvin" ${entry.toUnit === 'kelvin' ? 'selected' : ''}>K</option>
                            <option value="rankine" ${entry.toUnit === 'rankine' ? 'selected' : ''}>°R</option>
                        </select>
                    </div>
                    <div class="edit-actions">
                        <button onclick="app.saveEdit(${entry.id})"><i class="fas fa-save"></i> Simpan</button>
                        <button onclick="app.cancelEdit()"><i class="fas fa-times"></i> Batal</button>
                    </div>
                </div>
            </div>
        `;
    }

    editEntry(id) {
        this.editingId = id;
        this.loadHistory();
    }

    saveEdit(id) {
        const input = parseFloat(document.getElementById(`edit-input-${id}`).value);
        const fromUnit = document.getElementById(`edit-from-${id}`).value;
        const toUnit = document.getElementById(`edit-to-${id}`).value;

        if (!input || isNaN(input)) {
            this.showNotification('Masukkan angka yang valid!', 'error');
            return;
        }

        const result = this.calculateConversion(input, fromUnit, toUnit);
        
        this.history = this.history.map(entry => 
            entry.id === id 
                ? { ...entry, input, fromUnit, toUnit, result, timestamp: new Date().toLocaleString('id-ID') + ' (diperbarui)' }
                : entry
        );

        localStorage.setItem('tempHistory', JSON.stringify(this.history));
        this.editingId = null;
        this.loadHistory();
        this.showNotification('Entry berhasil diperbarui!', 'success');
    }

    cancelEdit() {
        this.editingId = null;
        this.loadHistory();
    }

    deleteEntry(id) {
        if (confirm('Apakah Anda yakin ingin menghapus entry ini?')) {
            this.history = this.history.filter(entry => entry.id !== id);
            localStorage.setItem('tempHistory', JSON.stringify(this.history));
            this.loadHistory();
            this.showNotification('Entry berhasil dihapus!', 'success');
        }
    }

    toggleHistoryDisplay() {
        const isVisible = this.historyContent.style.display === 'block';
        this.historyContent.style.display = isVisible ? 'none' : 'block';
        
        const toggleText = this.toggleHistory.querySelector('span');
        const toggleIcon = this.toggleHistory.querySelector('i');
        
        if (isVisible) {
            toggleText.textContent = 'Tampilkan';
            toggleIcon.className = 'fas fa-eye';
        } else {
            toggleText.textContent = 'Sembunyikan';
            toggleIcon.className = 'fas fa-eye-slash';
        }
    }

    clearAllHistory() {
        if (confirm('Apakah Anda yakin ingin menghapus semua riwayat?')) {
            this.history = [];
            localStorage.removeItem('tempHistory');
            this.loadHistory();
            this.showNotification('Semua riwayat berhasil dihapus!', 'success');
        }
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new TemperatureConverter();
});