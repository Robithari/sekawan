const prerender = require('prerender-node');

module.exports = (req, res) => {
  prerender.set('prerenderToken', 'IyWIluiXLmkV6R3ba5Ns'); // Ganti dengan token Anda
  prerender(req, res);
};
