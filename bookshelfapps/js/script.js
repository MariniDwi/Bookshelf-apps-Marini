document.addEventListener('DOMContentLoaded', function() {
    const submitForm = document.getElementById('form-buku');
    submitForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addBuku();
    });

    const searchInput = document.getElementById('search');
    const searchButton = document.getElementById('search-button');

    // Event listener for the search button click
    searchButton.addEventListener('click', function() {
        filterBooks(searchInput.value);
    });

    // Event listener for the Enter key press
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            filterBooks(searchInput.value);
        }
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

const books = [];
const RENDER_EVENT = 'render-books';

function addBuku() {
    const judulBuku = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const tahun = document.getElementById('tahun').value;

    const generatedID = generateId();
    const NewBook = generateNewBook(generatedID, judulBuku, author, tahun, false);
    books.push(NewBook);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateNewBook(id, title, author, year, isCompleted) {
    return {
        id: id,
        title: String(title),
        author: String(author),
        year: Number(year),
        isCompleted: Boolean(isCompleted)
    }
}

function filterBooks(searchQuery) {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filteredBooks = books.filter(book => book.title.toLowerCase().includes(lowerCaseQuery));

    displayBooks(filteredBooks);

    if (filteredBooks.length > 0) {
        const firstBookElement = document.getElementById(`buku-${filteredBooks[0].id}`);
        firstBookElement.scrollIntoView({ behavior: 'smooth' });
    }
}

function displayBooks(filteredBooks) {
    const belumDibaca = document.getElementById('belum-dibaca');
    belumDibaca.innerHTML = '';
   
    const sudahDibaca = document.getElementById('sudah-dibaca');
    sudahDibaca.innerHTML = '';

    for (const bookItem of filteredBooks) {
        const dataBuku = makeNewBook(bookItem);
        if (!bookItem.isCompleted) {
            belumDibaca.append(dataBuku);
        } else {
            sudahDibaca.append(dataBuku);
        }
    }
}

document.addEventListener(RENDER_EVENT, function () {
    displayBooks(books);
});

function makeNewBook(NewBook) {
    const textTitle = document.createElement('h2');
    textTitle.innerText = NewBook.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = 'Penulis: ' + NewBook.author;

    const textYear = document.createElement('p');
    textYear.innerText = 'Tahun: ' + NewBook.year;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textAuthor, textYear);

    const container = document.createElement('div');
    container.classList.add('item', 'buku');
    container.append(textContainer);
    container.setAttribute('id', `buku-${NewBook.id}`);

    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');
    checkButton.innerText = 'Selesai';

    checkButton.addEventListener('click', function() {
        bukuSudahDibaca(NewBook.id);
    });

    const hapusButton = document.createElement('button');
    hapusButton.classList.add('hapus-button');
    hapusButton.innerText = 'Hapus';

    hapusButton.addEventListener('click', function() {
        hapusBuku(NewBook.id);
    });

    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');
    undoButton.innerText = 'Kembali';

    undoButton.addEventListener('click', function() {
        undoBuku(NewBook.id);
    });

    if (NewBook.isCompleted) {
        checkButton.style.display = 'none';
    } else {
        undoButton.style.display = 'none';
    }

    container.append(checkButton, hapusButton, undoButton);
    return container;
}

function bukuSudahDibaca(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBuku(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function hapusBuku(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

const SAVED_EVENT = 'saved-books';
const STORAGE_KEY = 'BOOKSHELF-APPS';

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser anda tidak mendukung penyimpanan lokal');
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}
