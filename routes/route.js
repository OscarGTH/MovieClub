var express     = require('express');
var router      = express.Router();
const controller = require('../controller/controller');



router.get('/', controller.main);
router.get('/users', (req,res,next)=>{
  // Check that the session isn't null.
  if(req.session.user != null) {
    // Check that the user is permitted.
    if(req.session.user.role==0||req.session.user.role==1) {
      // Move on to next step.
      next()
    } else{
      // If the user is not admin nor registered user, render error view.
      res.render('error',{message: "Not permitted"});
      }
    } else{
      res.render('error',{message: "Not permitted"});
    }
  },controller.users);

// Route for main page.
router.get('/main',controller.main);

router.get('/login', controller.showLogin);
router.post('/login', controller.login);
router.post('/guestlogin',controller.guestlogin);

router.get('/register',controller.register)
router.get('/logout',controller.logout);

router.post('/user/add',controller.addUser);
router.post('/edit',controller.showUser);
router.post('/user/edit',controller.editUser);
router.post('/user/delete',controller.deleteUser);

router.get('/pay',controller.showPayForm);
router.post('/pay',controller.pay);
router.get('/events',controller.events);

module.exports = router;
