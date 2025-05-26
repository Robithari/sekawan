const renderNotFoundPage = (req, res) => {
    res.status(404).render('404', { message: 'Maaf halaman website yang anda masukan salah' });
};

module.exports = {
    renderNotFoundPage,
};
