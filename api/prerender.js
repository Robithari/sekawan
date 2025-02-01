const prerender = require('prerender-node');

module.exports = (req, res) => {
  prerender.set('prerenderToken', 'Qda1wQOGSWl5EkcA8twU'); // Ganti dengan token Anda
  prerender(req, res);
};
