const vscode = acquireVsCodeApi();
let currentEmbed = {};
let currentFormat = 'json';
let isColorPickerOpen = false;
let selectedPresetColor = null;

const colorNames = {
    '5865f2': 'Blurple',
    '57f287': 'Green',
    'fee75c': 'Yellow',
    'ed4245': 'Red',
    'eb459e': 'Pink',
    '95a5a6': 'Gray',
    '34495e': 'Dark Blue',
    '1abc9c': 'Turquoise',
    'e67e22': 'Orange',
    '9b59b6': 'Purple',
    'e74c3c': 'Crimson',
    '2ecc71': 'Emerald'
};

function getColorName(hexColor) {
    const hex = hexColor.toString(16).padStart(6, '0');
    return colorNames[hex] || 'Custom';
}

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function getColorAtPosition(x, y, width, height) {
    const hue = (x / width) * 360;
    const saturation = 100;
    const lightness = 100 - (y / height) * 100;
    return hslToHex(hue, saturation, lightness);
}

function hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function updateColorDisplay() {
    const colorInput = document.getElementById('colorInput').value;
    const colorDisplay = document.getElementById('colorDisplay');
    if (colorInput.startsWith('#')) {
        colorDisplay.style.backgroundColor = colorInput;
        updateSelectedColorName(colorInput);
    }
}

function updateSelectedColorName(hexColor) {
    const hex = hexColor.replace('#', '').toLowerCase();
    const colorName = colorNames[hex] || 'Custom';
    document.getElementById('selectedColorName').textContent = colorName;
}

function setColorFromPicker(x, y) {
    const picker = document.getElementById('colorPicker');
    const rect = picker.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const relativeX = Math.max(0, Math.min(x - rect.left, width));
    const relativeY = Math.max(0, Math.min(y - rect.top, height));
    const color = getColorAtPosition(relativeX, relativeY, width, height);
    document.getElementById('colorInput').value = color;
    updateColorDisplay();
    setColor(color);
    const indicator = document.getElementById('colorPickerIndicator');
    indicator.style.left = relativeX + 'px';
    indicator.style.top = relativeY + 'px';
    document.querySelectorAll('.preset-color').forEach(preset => {
        preset.classList.remove('selected');
    });
    selectedPresetColor = null;
}

function setColor(hexColor) {
    const colorValue = parseInt(hexColor.replace('#', ''), 16);
    currentEmbed.color = colorValue;
    updateEmbed();
}

function toggleColorPicker() {
    const pickerContainer = document.getElementById('colorPickerContainer');
    isColorPickerOpen = !isColorPickerOpen;
    if (isColorPickerOpen) {
        pickerContainer.classList.add('active');
        document.addEventListener('mousedown', handleOutsideClick);
        const currentColor = document.getElementById('colorInput').value;
        if (currentColor) {
            const rgb = hexToRgb(currentColor);
            const hue = rgbToHue(rgb.r, rgb.g, rgb.b);
            const sat = rgbToSaturation(rgb.r, rgb.g, rgb.b);
            const light = rgbToLightness(rgb.r, rgb.g, rgb.b);
            const picker = document.getElementById('colorPicker');
            const rect = picker.getBoundingClientRect();
            const x = (hue / 360) * rect.width;
            const y = ((100 - light) / 100) * rect.height;
            const indicator = document.getElementById('colorPickerIndicator');
            indicator.style.left = x + 'px';
            indicator.style.top = y + 'px';
        }
    } else {
        pickerContainer.classList.remove('active');
        document.removeEventListener('mousedown', handleOutsideClick);
    }
}

function rgbToHue(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h;
    if (max === min) {
        h = 0;
    } else if (max === r) {
        h = ((g - b) / (max - min)) % 6;
    } else if (max === g) {
        h = (b - r) / (max - min) + 2;
    } else {
        h = (r - g) / (max - min) + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    return h;
}

function rgbToSaturation(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) {
        return 0;
    } else {
        return l > 0.5 
            ? (max - min) / (2 - max - min) * 100
            : (max - min) / (max + min) * 100;
    }
}

function rgbToLightness(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return ((max + min) / 2) * 100;
}

function handleOutsideClick(event) {
    const pickerContainer = document.getElementById('colorPickerContainer');
    const colorDisplay = document.getElementById('colorDisplay');
    if (!pickerContainer.contains(event.target) && 
        !colorDisplay.contains(event.target)) {
        toggleColorPicker();
    }
}

function selectPresetColor(element, hexColor, colorName) {
    document.querySelectorAll('.preset-color').forEach(preset => {
        preset.classList.remove('selected');
    });
    element.classList.add('selected');
    selectedPresetColor = hexColor;
    const fullHex = '#' + hexColor;
    document.getElementById('colorInput').value = fullHex;
    updateColorDisplay();
    setColor(fullHex);
    document.getElementById('selectedColorName').textContent = colorName;
    if (isColorPickerOpen) {
        toggleColorPicker();
    }
}

function parseDiscordEmojis(text) {
    if (!text) return text;
    let result = text;
    const emojiRanges = [
        /[\u{1F300}-\u{1F9FF}]/gu,
        /[\u{2600}-\u{26FF}]/gu,
        /[\u{2700}-\u{27BF}]/gu,
        /[\u{1F900}-\u{1F9FF}]/gu,
        /[\u{1F1E0}-\u{1F1FF}]/gu
    ];
    emojiRanges.forEach(range => {
        result = result.replace(range, emoji => {
            const codePoint = emoji.codePointAt(0).toString(16);
            return `<img class="emoji" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${codePoint}.png" alt="${emoji}" title="${emoji}">`;
        });
    });
    return result;
}

function updateCounters() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    document.getElementById('titleChars').textContent = `${title.length}/256`;
    document.getElementById('descChars').textContent = `${description.length}/4096`;
    document.getElementById('totalChars').textContent = `${title.length + description.length}/6000`;
}

function setupSectionToggles() {
    document.getElementById('toggleAuthorBtn').addEventListener('click', () => {
        toggleSection('authorSection', 'toggleAuthorBtn');
    });
    document.getElementById('toggleFooterBtn').addEventListener('click', () => {
        toggleSection('footerSection', 'toggleFooterBtn');
    });
    document.getElementById('toggleThumbnailBtn').addEventListener('click', () => {
        toggleSection('thumbnailSection', 'toggleThumbnailBtn');
    });
    document.getElementById('toggleImageBtn').addEventListener('click', () => {
        toggleSection('imageSection', 'toggleImageBtn');
    });
}

function toggleSection(sectionId, buttonId) {
    const section = document.getElementById(sectionId);
    const button = document.getElementById(buttonId);
    if (section.style.display === 'none') {
        section.style.display = 'block';
        button.textContent = '−';
    } else {
        section.style.display = 'none';
        button.textContent = '+';
    }
}

function setupFormListeners() {
    document.getElementById('url').addEventListener('input', updateEmbed);
    document.getElementById('authorName').addEventListener('input', updateEmbed);
    document.getElementById('authorUrl').addEventListener('input', updateEmbed);
    document.getElementById('authorIcon').addEventListener('input', updateEmbed);
    document.getElementById('footerText').addEventListener('input', updateEmbed);
    document.getElementById('footerIcon').addEventListener('input', updateEmbed);
    document.getElementById('thumbnailUrl').addEventListener('input', updateEmbed);
    document.getElementById('imageUrl').addEventListener('input', updateEmbed);
    document.getElementById('timestamp').addEventListener('change', function() {
        const customInput = document.getElementById('customTimestamp');
        if (this.value === 'custom') {
            customInput.style.display = 'block';
        } else {
            customInput.style.display = 'none';
            updateEmbed();
        }
    });
    document.getElementById('customTimestamp').addEventListener('change', updateEmbed);
}

function updateEmbed() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    currentEmbed.title = title || undefined;
    currentEmbed.description = description || undefined;
    const url = document.getElementById('url').value;
    currentEmbed.url = url || undefined;
    const authorName = document.getElementById('authorName').value;
    const authorUrl = document.getElementById('authorUrl').value;
    const authorIcon = document.getElementById('authorIcon').value;
    if (authorName) {
        currentEmbed.author = {
            name: authorName,
            url: authorUrl || undefined,
            icon_url: authorIcon || undefined
        };
    } else {
        currentEmbed.author = undefined;
    }
    const footerText = document.getElementById('footerText').value;
    const footerIcon = document.getElementById('footerIcon').value;
    if (footerText) {
        currentEmbed.footer = {
            text: footerText,
            icon_url: footerIcon || undefined
        };
    } else {
        currentEmbed.footer = undefined;
    }
    const thumbnailUrl = document.getElementById('thumbnailUrl').value;
    if (thumbnailUrl) {
        currentEmbed.thumbnail = { url: thumbnailUrl };
    } else {
        currentEmbed.thumbnail = undefined;
    }
    const imageUrl = document.getElementById('imageUrl').value;
    if (imageUrl) {
        currentEmbed.image = { url: imageUrl };
    } else {
        currentEmbed.image = undefined;
    }
    const timestamp = document.getElementById('timestamp').value;
    if (timestamp === 'now') {
        currentEmbed.timestamp = 'now';
    } else if (timestamp === 'custom') {
        const customDate = document.getElementById('customTimestamp').value;
        if (customDate) {
            currentEmbed.timestamp = new Date(customDate).toISOString();
        }
    } else {
        currentEmbed.timestamp = undefined;
    }
    updateCounters();
    updatePreview();
    vscode.postMessage({
        type: 'updateEmbed',
        data: { embed: currentEmbed }
    });
    requestCode();
}

function updatePreview() {
    const titleHtml = parseDiscordEmojis(currentEmbed.title || 'Embed Title');
    const descriptionHtml = parseDiscordEmojis(currentEmbed.description || 'Embed description will appear here...');
    document.getElementById('previewTitle').innerHTML = titleHtml;
    document.getElementById('previewDescription').innerHTML = descriptionHtml;
    const embedPreview = document.getElementById('embedPreview');
    if (currentEmbed.color !== undefined) {
        embedPreview.style.borderLeftColor = '#' + currentEmbed.color.toString(16).padStart(6, '0');
    } else {
        embedPreview.style.borderLeftColor = '#5865f2';
    }
    const authorPreview = document.getElementById('previewAuthor');
    const authorNamePreview = document.getElementById('authorNamePreview');
    const authorIconPreview = document.getElementById('authorIconPreview');
    if (currentEmbed.author) {
        authorPreview.style.display = 'flex';
        authorNamePreview.textContent = currentEmbed.author.name;
        if (currentEmbed.author.icon_url) {
            authorIconPreview.style.display = 'block';
            authorIconPreview.src = currentEmbed.author.icon_url;
            authorIconPreview.alt = currentEmbed.author.name;
        } else {
            authorIconPreview.style.display = 'none';
        }
    } else {
        authorPreview.style.display = 'none';
    }
    const footerPreview = document.getElementById('previewFooter');
    const footerTextPreview = document.getElementById('footerTextPreview');
    const footerIconPreview = document.getElementById('footerIconPreview');
    const footerTimestamp = document.getElementById('footerTimestamp');
    if (currentEmbed.footer) {
        footerPreview.style.display = 'flex';
        footerTextPreview.textContent = currentEmbed.footer.text;
        if (currentEmbed.footer.icon_url) {
            footerIconPreview.style.display = 'block';
            footerIconPreview.src = currentEmbed.footer.icon_url;
            footerIconPreview.alt = currentEmbed.footer.text;
        } else {
            footerIconPreview.style.display = 'none';
        }
        if (currentEmbed.timestamp) {
            footerTimestamp.style.display = 'inline';
            const date = currentEmbed.timestamp === 'now' ? new Date() : new Date(currentEmbed.timestamp);
            footerTimestamp.textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        } else {
            footerTimestamp.style.display = 'none';
        }
    } else {
        footerPreview.style.display = 'none';
    }
    const thumbnailPreview = document.getElementById('previewThumbnail');
    const thumbnailImg = document.getElementById('thumbnailPreview');
    if (currentEmbed.thumbnail) {
        thumbnailPreview.style.display = 'block';
        thumbnailImg.src = currentEmbed.thumbnail.url;
        thumbnailImg.alt = 'Embed thumbnail';
    } else {
        thumbnailPreview.style.display = 'none';
    }
    const imagePreview = document.getElementById('previewImage');
    const imageImg = document.getElementById('imagePreview');
    if (currentEmbed.image) {
        imagePreview.style.display = 'block';
        imageImg.src = currentEmbed.image.url;
        imageImg.alt = 'Embed image';
    } else {
        imagePreview.style.display = 'none';
    }
    const previewFields = document.getElementById('previewFields');
    previewFields.innerHTML = '';
    if (currentEmbed.fields && currentEmbed.fields.length > 0) {
        currentEmbed.fields.forEach(field => {
            const previewField = document.createElement('div');
            previewField.className = 'embed-field';
            previewField.style.gridColumn = field.inline ? 'auto' : '1 / -1';
            const fieldNameHtml = parseDiscordEmojis(field.name || 'Unnamed Field');
            const fieldValueHtml = parseDiscordEmojis(field.value || 'No value');
            previewField.innerHTML = `
                <div class="field-name">${fieldNameHtml}</div>
                <div class="field-value">${fieldValueHtml}</div>
            `;
            previewFields.appendChild(previewField);
        });
    }
}

function initializeForm() {
    if (currentEmbed.url) {
        document.getElementById('url').value = currentEmbed.url;
    }
    if (currentEmbed.author) {
        document.getElementById('authorName').value = currentEmbed.author.name || '';
        document.getElementById('authorUrl').value = currentEmbed.author.url || '';
        document.getElementById('authorIcon').value = currentEmbed.author.icon_url || '';
        toggleSection('authorSection', 'toggleAuthorBtn');
    }
    if (currentEmbed.footer) {
        document.getElementById('footerText').value = currentEmbed.footer.text || '';
        document.getElementById('footerIcon').value = currentEmbed.footer.icon_url || '';
        toggleSection('footerSection', 'toggleFooterBtn');
    }
    if (currentEmbed.thumbnail) {
        document.getElementById('thumbnailUrl').value = currentEmbed.thumbnail.url || '';
        toggleSection('thumbnailSection', 'toggleThumbnailBtn');
    }
    if (currentEmbed.image) {
        document.getElementById('imageUrl').value = currentEmbed.image.url || '';
        toggleSection('imageSection', 'toggleImageBtn');
    }
    if (currentEmbed.timestamp) {
        if (currentEmbed.timestamp === 'now') {
            document.getElementById('timestamp').value = 'now';
        } else {
            document.getElementById('timestamp').value = 'custom';
            document.getElementById('customTimestamp').value = new Date(currentEmbed.timestamp).toISOString().slice(0, 16);
            document.getElementById('customTimestamp').style.display = 'block';
        }
    }
}

function renderFields() {
    const fieldsList = document.getElementById('fieldsList');
    const previewFields = document.getElementById('previewFields');
    fieldsList.innerHTML = '';
    previewFields.innerHTML = '';
    if (!currentEmbed.fields || currentEmbed.fields.length === 0) {
        fieldsList.innerHTML = '<div class="empty-state">No fields added yet</div>';
        return;
    }
    currentEmbed.fields.forEach((field, index) => {
        const fieldElement = document.createElement('div');
        fieldElement.className = 'field-item';
        fieldElement.innerHTML = `
            <div class="field-header">
                <input type="text" class="field-name-input" placeholder="Field name" 
                       value="${field.name || ''}" data-index="${index}">
                <div class="field-actions">
                    <button type="button" class="field-btn" title="Move up">
                        ↑
                    </button>
                    <button type="button" class="field-btn" title="Move down">
                        ↓
                    </button>
                    <button type="button" class="field-btn" title="Remove">
                        ×
                    </button>
                </div>
            </div>
            <div class="field-content">
                <textarea class="field-value-input" placeholder="Field value" 
                          data-index="${index}">${field.value || ''}</textarea>
            </div>
            <div class="inline-toggle">
                <input type="checkbox" id="inline-${index}" ${field.inline ? 'checked' : ''}>
                <label for="inline-${index}">Inline</label>
            </div>
        `;
        fieldsList.appendChild(fieldElement);
        const nameInput = fieldElement.querySelector('.field-name-input');
        const valueTextarea = fieldElement.querySelector('.field-value-input');
        const moveUpBtn = fieldElement.querySelector('.field-btn:nth-child(1)');
        const moveDownBtn = fieldElement.querySelector('.field-btn:nth-child(2)');
        const removeBtn = fieldElement.querySelector('.field-btn:nth-child(3)');
        const inlineCheckbox = fieldElement.querySelector('input[type="checkbox"]');
        nameInput.addEventListener('input', () => {
            const idx = parseInt(nameInput.dataset.index);
            if (currentEmbed.fields[idx]) {
                currentEmbed.fields[idx].name = nameInput.value;
                updateEmbed();
            }
        });
        valueTextarea.addEventListener('input', () => {
            const idx = parseInt(valueTextarea.dataset.index);
            if (currentEmbed.fields[idx]) {
                currentEmbed.fields[idx].value = valueTextarea.value;
                updateEmbed();
            }
        });
        moveUpBtn.addEventListener('click', () => moveField(index, -1));
        moveDownBtn.addEventListener('click', () => moveField(index, 1));
        removeBtn.addEventListener('click', () => removeField(index));
        inlineCheckbox.addEventListener('change', (e) => toggleInline(index, e.target.checked));
        const previewField = document.createElement('div');
        previewField.className = 'embed-field';
        previewField.style.gridColumn = field.inline ? 'auto' : '1 / -1';
        const fieldNameHtml = parseDiscordEmojis(field.name || 'Unnamed Field');
        const fieldValueHtml = parseDiscordEmojis(field.value || 'No value');
        previewField.innerHTML = `
            <div class="field-name">${fieldNameHtml}</div>
            <div class="field-value">${fieldValueHtml}</div>
        `;
        previewFields.appendChild(previewField);
    });
}

function moveField(index, direction) {
    if (!currentEmbed.fields) return;
    if (index + direction < 0 || index + direction >= currentEmbed.fields.length) return;
    const temp = currentEmbed.fields[index];
    currentEmbed.fields[index] = currentEmbed.fields[index + direction];
    currentEmbed.fields[index + direction] = temp;
    renderFields();
    updatePreview();
    updateEmbed();
}

function removeField(index) {
    if (!currentEmbed.fields) return;
    currentEmbed.fields.splice(index, 1);
    renderFields();
    updatePreview();
    updateEmbed();
}

function toggleInline(index, inline) {
    if (!currentEmbed.fields || !currentEmbed.fields[index]) return;
    currentEmbed.fields[index].inline = inline;
    renderFields();
    updatePreview();
    updateEmbed();
}

function addField() {
    if (!currentEmbed.fields) {
        currentEmbed.fields = [];
    }
    currentEmbed.fields.push({
        name: 'New Field',
        value: 'Field value',
        inline: false
    });
    renderFields();
    updatePreview();
    updateEmbed();
}

function requestCode() {
    vscode.postMessage({
        type: 'requestCode',
        data: { embed: currentEmbed, format: currentFormat }
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

document.getElementById('title').addEventListener('input', updateEmbed);
document.getElementById('description').addEventListener('input', updateEmbed);
document.getElementById('colorInput').addEventListener('input', function() {
    updateColorDisplay();
    const hexColor = this.value;
    if (hexColor.startsWith('#') && hexColor.length === 7) {
        setColor(hexColor);
    }
});

document.getElementById('colorDisplay').addEventListener('click', toggleColorPicker);
document.getElementById('colorPicker').addEventListener('mousedown', (e) => {
    setColorFromPicker(e.clientX, e.clientY);
    const mouseMoveHandler = (moveEvent) => {
        setColorFromPicker(moveEvent.clientX, moveEvent.clientY);
    };
    const mouseUpHandler = () => {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    };
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
});

document.querySelectorAll('.preset-color').forEach(preset => {
    preset.addEventListener('click', () => {
        const hexColor = preset.getAttribute('data-color');
        const colorName = preset.getAttribute('data-name');
        selectPresetColor(preset, hexColor, colorName);
    });
});

document.getElementById('formatSelect').addEventListener('change', function() {
    currentFormat = this.value;
    document.getElementById('codeFormat').textContent = this.value.toUpperCase() + ' Code';
    vscode.postMessage({
        type: 'changeFormat',
        data: { format: currentFormat }
    });
    requestCode();
});

document.getElementById('addFieldBtn').addEventListener('click', addField);
document.getElementById('copyBtn').addEventListener('click', function() {
    const code = document.getElementById('codeOutput').textContent;
    vscode.postMessage({
        type: 'copyToClipboard',
        data: { code: code }
    });
});

document.getElementById('applyBtn').addEventListener('click', function() {
    const code = document.getElementById('codeOutput').textContent;
    vscode.postMessage({
        type: 'applyToFile',
        data: { code: code, format: currentFormat }
    });
});

document.getElementById('cancelBtn').addEventListener('click', function() {
    vscode.postMessage({ type: 'closeEditor' });
});

window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
        case 'codeGenerated':
            document.getElementById('codeOutput').textContent = message.data.code;
            break;
        case 'showNotification':
            showNotification(message.data.message);
            break;
        case 'updateState':
            if (message.data.embed) {
                currentEmbed = message.data.embed;
                document.getElementById('title').value = currentEmbed.title || '';
                document.getElementById('description').value = currentEmbed.description || '';
                if (currentEmbed.color) {
                    const hexColor = '#' + currentEmbed.color.toString(16).padStart(6, '0');
                    document.getElementById('colorInput').value = hexColor;
                    updateColorDisplay();
                    updateSelectedColorName(hexColor);
                }
                initializeForm();
                updatePreview();
                updateCounters();
                renderFields();
                requestCode();
            }
            if (message.data.format) {
                currentFormat = message.data.format;
                document.getElementById('formatSelect').value = currentFormat;
                document.getElementById('codeFormat').textContent = currentFormat.toUpperCase() + ' Code';
                requestCode();
            }
            break;
    }
});

setupSectionToggles();
setupFormListeners();
updateColorDisplay();
updateCounters();
renderFields();
updatePreview();
requestCode();