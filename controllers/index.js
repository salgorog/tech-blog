const router = require('express').Router();
const homeRoutes = require('./home-routes.js');
const dashboarddRoutes = require('./dashboard-routes.js')

const apiRoutes = require('./api');

router.use('/dashboard', dashboarddRoutes);
router.use('/api', apiRoutes);
router.use('/', homeRoutes);

router.use((req, res) => {
  res.status(404).end();
});

module.exports = router;