function search() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const allContent = document.body.innerText.toLowerCase();

    if (allContent.includes(searchInput)) {
        alert(`Found: ${searchInput}`);
    } else {
        alert(`Not found: ${searchInput}`);
    }
}
