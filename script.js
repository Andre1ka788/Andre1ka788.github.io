// Функции для работы с пользователями
function getCurrentUser() {
    try {
        const user = localStorage.getItem('ss_current_user');
        return user ? JSON.parse(user) : null;
    } catch (e) {
        return null;
    }
}

function setCurrentUser(user) {
    try {
        localStorage.setItem('ss_current_user', JSON.stringify(user));
    } catch (e) {
        console.error('Ошибка сохранения пользователя:', e);
    }
}

function logout() {
    localStorage.removeItem('ss_current_user');
    window.location.href = 'index.html';
}

function updateHeaderAuth() {
    const currentUser = getCurrentUser();
    const btnLogin = document.getElementById('btn-login');
    const btnRegister = document.getElementById('btn-register');
    const btnAdd = document.getElementById('btn-add');

    if (currentUser) {
        // Пользователь авторизован
        if (btnLogin) btnLogin.style.display = 'none';
        if (btnRegister) btnRegister.style.display = 'none';
        if (btnAdd) {
            btnAdd.textContent = '+Добавить скриншот';
            btnAdd.onclick = (e) => {
                e.preventDefault();
                window.location.href = 'add.html';
            };
        }
    } else {
        // Пользователь не авторизован
        if (btnLogin) btnLogin.style.display = 'inline-block';
        if (btnRegister) btnRegister.style.display = 'inline-block';
        if (btnAdd) {
            btnAdd.textContent = '+Добавить скриншот';
            btnAdd.onclick = (e) => {
                e.preventDefault();
                openModal('login');
            };
        }
    }
}

// Функции для работы со скриншотами
function getScreenshots() {
    try {
        const raw = localStorage.getItem('ss_screenshots');
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error('Ошибка чтения localStorage', e);
        return [];
    }
}

function saveScreenshot(item) {
    const arr = getScreenshots();
    arr.push(item);
    localStorage.setItem('ss_screenshots', JSON.stringify(arr));
}

// Переменные для пагинации
let currentPage = 1;
const ITEMS_PER_PAGE = 6;

// Функция группировки скриншотов по месяцам
function groupScreenshotsByMonth(screenshots) {
    const grouped = {};
    
    screenshots.forEach(screenshot => {
        const date = new Date(screenshot.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        
        if (!grouped[monthKey]) {
            grouped[monthKey] = [];
        }
        
        grouped[monthKey].push(screenshot);
    });
    
    // Сортируем месяцы от новых к старым
    const sortedGroups = {};
    Object.keys(grouped)
        .sort((a, b) => new Date(b + '-01') - new Date(a + '-01'))
        .forEach(key => {
            sortedGroups[key] = grouped[key];
        });
    
    return sortedGroups;
}

// Функция форматирования заголовка месяца (русские месяцы)
function formatMonthHeader(monthKey) {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, month);
    
    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    const monthName = monthNames[date.getMonth()];
    return `${monthName}, ${date.getFullYear()}`;
}

// Функция для получения пагинированных данных
function getPaginatedScreenshots(allImages, page, itemsPerPage) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allImages.slice(0, endIndex);
}

function renderCards() {
    const gallery = document.getElementById('gallery');
    const cardTemplate = document.getElementById('card-template');
    const loadMoreBtn = document.getElementById('load-more');
    
    if (!gallery || !cardTemplate) return;

    gallery.innerHTML = '';

    // Массив с локальными изображениями (разные месяцы)
    const localImages = [
        {
            id: 'local-1',
            url: 'images/shot1.jpg',
            filename: 'shot1.jpg',
            date: new Date('2025-01-15').toISOString(), // Январь
            private: false
        },
        {
            id: 'local-2', 
            url: 'images/shot2.jpg',
            filename: 'shot2.jpg',
            date: new Date('2025-01-14').toISOString(), // Январь
            private: false
        },
        {
            id: 'local-3',
            url: 'images/shot3.jpg',
            filename: 'shot3.jpg',
            date: new Date('2024-12-20').toISOString(), // Декабрь
            private: false
        },
        {
            id: 'local-4',
            url: 'images/shot4.jpg',
            filename: 'shot4.jpg',
            date: new Date('2024-12-15').toISOString(), // Декабрь
            private: false
        },
        {
            id: 'local-5',
            url: 'images/shot5.jpg',
            filename: 'shot5.jpg',
            date: new Date('2024-12-10').toISOString(), // Декабрь
            private: false
        },
        {
            id: 'local-6',
            url: 'images/shot6.jpg',
            filename: 'shot6.jpg',
            date: new Date('2024-11-05').toISOString(), // Ноябрь
            private: false
        },
        {
            id: 'local-7',
            url: 'images/shot7.jpg',
            filename: 'shot7.jpg',
            date: new Date('2024-10-25').toISOString(), // Октябрь
            private: false
        },
        {
            id: 'local-8',
            url: 'images/shot8.jpg',
            filename: 'shot8.jpg',
            date: new Date('2024-10-20').toISOString(), // Октябрь
            private: false
        }
    ];

    // Получаем сохранённые скриншоты из localStorage
    const savedScreenshots = getScreenshots();
    const publicSaved = savedScreenshots.filter(it => !it.private);
    
    // Объединяем локальные изображения с сохранёнными и сортируем по дате (новые сначала)
    const allImages = [...localImages, ...publicSaved]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Если нет изображений вообще - показываем заглушки
    if (allImages.length === 0) {
        const monthCards = document.createElement('div');
        monthCards.className = 'month-cards';
        
        for (let i = 0; i < 6; i++) {
            const node = cardTemplate.content.cloneNode(true);
            const link = node.querySelector('.card-thumb');
            const img = node.querySelector('img');
            img.src = `https://picsum.photos/seed/${i + 100}/800/600`;
            img.alt = 'Пример скриншота';
            link.href = '#';
            node.querySelector('.card-date').textContent = new Date(Date.now() - i * 86400000).toLocaleDateString('ru-RU');
            monthCards.appendChild(node);
        }
        gallery.appendChild(monthCards);
        
        // Скрываем кнопку "Показать ещё"
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }

    // Получаем данные для текущей страницы
    const paginatedImages = getPaginatedScreenshots(allImages, currentPage, ITEMS_PER_PAGE);
    
    // Группируем по месяцам только отображаемые изображения
    const groupedByMonth = groupScreenshotsByMonth(paginatedImages);

    // Отображаем по месяцам
    Object.keys(groupedByMonth).forEach(monthKey => {
        // Добавляем заголовок месяца
        const monthHeader = document.createElement('div');
        monthHeader.className = 'month-header';
        monthHeader.textContent = formatMonthHeader(monthKey);
        gallery.appendChild(monthHeader);

        // Создаем контейнер для карточек этого месяца
        const monthCards = document.createElement('div');
        monthCards.className = 'month-cards';

        // Добавляем карточки для этого месяца
        groupedByMonth[monthKey].forEach(item => {
            const node = cardTemplate.content.cloneNode(true);
            const link = node.querySelector('.card-thumb');
            const img = node.querySelector('img');

            // Устанавливаем правильные ссылки для карточек
            link.href = `view.html?id=${encodeURIComponent(item.id)}`;
            
            // Определяем источник изображения
            if (item.dataUrl && item.dataUrl.startsWith('data:image')) {
                img.src = item.dataUrl;
            } else if (item.url) {
                img.src = item.url;
            } else {
                img.src = `https://picsum.photos/seed/${item.id}/800/600`;
            }

            img.alt = item.filename || 'screenshot';
            
            // Обновляем дату (уже внутри изображения)
            const dateElement = node.querySelector('.card-date');
            dateElement.textContent = new Date(item.date).toLocaleDateString('ru-RU');
            
            monthCards.appendChild(node);
        });

        gallery.appendChild(monthCards);
    });

    // Управление кнопкой "Показать ещё"
    if (loadMoreBtn) {
        const totalItems = allImages.length;
        const displayedItems = paginatedImages.length;
        
        if (displayedItems >= totalItems) {
            // Все элементы показаны, скрываем кнопку
            loadMoreBtn.style.display = 'none';
        } else {
            // Есть еще элементы, показываем кнопку
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.textContent = `Показать ещё`;
        }
    }
}   

// Функция для загрузки дополнительных элементов
function loadMoreItems() {
    currentPage++;
    renderCards();
}

// Функции для модальных окон
function openModal(tab = 'login') {
    const modal = document.getElementById('modal');
    if (!modal) return;
    
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
    activateTab(tab);
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (!modal) return;
    
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
}

function activateTab(tab) {
    const tabs = document.querySelectorAll('.tab');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    tabs.forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tab);
        // Устанавливаем прозрачность для неактивных вкладок
        if (t.dataset.tab !== tab) {
            t.style.opacity = '0.7';
        } else {
            t.style.opacity = '1';
        }
    });
    
    if (formLogin) formLogin.classList.toggle('visible', tab === 'login');
    if (formRegister) formRegister.classList.toggle('visible', tab === 'register');
}
// Функции для загрузки файлов
function handleFileUpload(file, callback) {
    const MAX_SIZE = 3 * 1024 * 1024;
    
    if (!file) return false;
    if (!file.type.startsWith('image/')) {
        alert('Только изображения!');
        return false;
    }
    if (file.size > MAX_SIZE) {
        alert('Макс. 3 МБ');
        return false;
    }
    
    const reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.readAsDataURL(file);
    return true;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация галереи
    renderCards();
    updateHeaderAuth();

    // Обработчики модалки входа/регистрации
    const modal = document.getElementById('modal');
    const btnLogin = document.getElementById('btn-login');
    const btnRegister = document.getElementById('btn-register');
    const modalClose = document.getElementById('modal-close');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    if (btnLogin) {
        btnLogin.addEventListener('click', () => openModal('login'));
    }
    
    if (btnRegister) {
        btnRegister.addEventListener('click', () => openModal('register'));
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeModal);
    }

    // Обработчики переключения табов
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => activateTab(tab.dataset.tab));
    });

    document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab.dataset.tab));
    });

    // Обработчики форм авторизации
    if (formLogin) {
        formLogin.addEventListener('submit', e => {
            e.preventDefault();
            const formData = new FormData(formLogin);
            const email = formData.get('email');
            const password = formData.get('password');
            
            // Простая демо-авторизация
            const users = JSON.parse(localStorage.getItem('ss_users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                setCurrentUser(user);
                alert('Успешный вход!');
                closeModal();
                updateHeaderAuth();
            } else {
                alert('Неверный email или пароль');
            }
        });
    }

    if (formRegister) {
        formRegister.addEventListener('submit', e => {
            e.preventDefault();
            const formData = new FormData(formRegister);
            const username = formData.get('username');
            const email = formData.get('email');
            const password = formData.get('password');
            const confirm = formData.get('confirm');
            const phone = formData.get('phone');
            
            // Валидация телефона
            const phoneRegex = /^\+?[0-9\s\-\(\)]{10,15}$/;
            if (!phoneRegex.test(phone)) {
                alert('Введите корректный номер телефона');
                return;
            }
            
            if (password !== confirm) {
                alert('Пароли не совпадают');
                return;
            }
            
            // Проверяем, нет ли уже пользователя с таким email
            const users = JSON.parse(localStorage.getItem('ss_users') || '[]');
            if (users.find(u => u.email === email)) {
                alert('Пользователь с таким email уже существует');
                return;
            }
            
            // Создаем нового пользователя
            const newUser = {
                id: Date.now().toString(),
                username: username,
                email: email,
                password: password,
                phone: phone,
                createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('ss_users', JSON.stringify(users));
            setCurrentUser(newUser);
            
            alert('Регистрация прошла успешно!');
            closeModal();
            updateHeaderAuth();
        });
    }

    // Обработчик кнопки "Показать ещё"
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreItems);
    }

    // Модалка загрузки (если используется на главной)
    const uploadModal = document.getElementById('upload-modal');
    if (uploadModal) {
        const btnAdd = document.getElementById('btn-add');
        const uploadBackdrop = document.getElementById('upload-backdrop');
        const uploadClose = document.getElementById('upload-close');
        const cancelUpload = document.getElementById('cancel-upload');
        const uploadForm = document.getElementById('upload-form');
        const fileInput = document.getElementById('fileInput');
        const privateCheck = document.getElementById('privateCheck');
        const preview = document.getElementById('preview');
        const previewImg = document.getElementById('preview-img');

        function openUploadModal() {
            const currentUser = getCurrentUser();
            if (!currentUser) {
                openModal('login');
                return;
            }
            uploadModal.style.display = 'flex';
            uploadModal.setAttribute('aria-hidden', 'false');
        }

        function closeUploadModal() {
            uploadModal.style.display = 'none';
            uploadModal.setAttribute('aria-hidden', 'true');
            if (preview) preview.classList.add('hidden');
            if (previewImg) previewImg.src = '';
            if (fileInput) fileInput.value = '';
        }

        if (btnAdd) {
            btnAdd.addEventListener('click', e => {
                e.preventDefault();
                openUploadModal();
            });
        }

        if (uploadBackdrop) uploadBackdrop.addEventListener('click', closeUploadModal);
        if (uploadClose) uploadClose.addEventListener('click', closeUploadModal);
        if (cancelUpload) cancelUpload.addEventListener('click', closeUploadModal);

        if (fileInput) {
            fileInput.addEventListener('change', e => {
                handleFileUpload(e.target.files[0], (dataUrl) => {
                    if (previewImg) previewImg.src = dataUrl;
                    if (preview) preview.classList.remove('hidden');
                });
            });
        }

        if (uploadForm) {
            uploadForm.addEventListener('submit', e => {
                e.preventDefault();
                const file = fileInput?.files[0];
                if (!file) {
                    alert('Выберите файл!');
                    return;
                }

                handleFileUpload(file, (dataUrl) => {
                    const id = 'upload-' + Date.now().toString(36);
                    const item = {
                        id,
                        dataUrl,
                        filename: file.name,
                        date: new Date().toISOString(),
                        private: !!privateCheck?.checked,
                        userId: getCurrentUser()?.id
                    };
                    
                    saveScreenshot(item);
                    alert('Скриншот добавлен!');
                    closeUploadModal();
                    
                    // Сбрасываем пагинацию при добавлении нового скриншота
                    currentPage = 1;
                    renderCards();
                });
            });
        }
    }
});