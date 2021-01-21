const router = require('express').Router()
const { User, Post } = require('../../models');
const withAuth = require('../../utils/auth')

//GET all users
router.get('/', (req,res) => {
    //access our User Model and run .findAll() method)
    User.findAll({
        attributes: {exclude: ['password']}
    })
        .then(dbUserData => res.json(dbUserData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});
//GET one user
router.get('/:id', (req,res) => {
    User.findOne({
        attributes: {exclude: ['password']},
        where: {
            id: req.params.id
        },
        include: [
            {
                model: Post,
                attributes: ['id','title','post_url','created_at']
            },
            {
                model: Comment,
                attributes: ['id','comment_text','created_at'],
                include: {
                    model: Post,
                    attributes: ['title']
                }
            },
            {
                model: Post,
                attributes: ['title'],
                through: ValidationError,
                as: 'voted_posts'
            }
        ]
    })
    .then(dbUserData => {
        if(!dbUserData) {
            res.status(404).json({message: 'No user found with this id'});
            return;
        }
        res.json(dbUserData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});
//POST a new user
router.post('/',  (req, res) => {
    // expects {username: 'Lernantino', email: 'lernantino@gmail.com', password: 'password1234'}
    User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    })
      .then(dbUserData => {
          req.session.save(() => {
              req.session.user_id = dbUserData.id;
              req.session.username = dbUserData.username;
              req.session.loggedIn = true;

              res.json(dbUserData);
          })
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  });

//Authorize the user
router.post('/login', (req,res)=>{
    User.findOne({
        where: {
            email: req.body.email
        }
    })
    .then(dbUserData =>{
        if(!dbUserData) {
            res.status(400).json({message: 'No user with that email address!'});
           return;
        }
        const validPassword = dbUserData.checkPassword(req.body.password);
        if(!validPassword){
            res.status(400).json({message: 'Incorrect Password!'});
            return;
        }
        req.session.save(() => {
            req.session.user_id = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;


            res.json({ user: dbUserData, message: "You are now logged in!" })  
        })
    });
});
//UPDATE all users
router.put('/:id', withAuth, (req,res) => {
    User.update(req.body, {
        individualHooks: true,
        where: {
            id: req.params.id
        }
    })
    .then(dbUserData => {
        if(!dbUserData[0]){
            res.status(404).json({message: 'No user found with this id'});
            return;
        }
        res.json(dbUserData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});
//DELETE all users
router.delete('/:id', withAuth, (req,res) => {
    User.destroy({
        where: {
            id: req.params.id
        }
    })
    .then(dbUserData => {
        if(!dbUserData){
            res.status(404).json({ message: 'No user found with this id'});
            return;
        }
        res.json(dbUserData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

router.post('/logout',  (req,res) =>{
    if(req.session.loggedIn){
        req.session.destroy(()=>{
            res.status(204).end();
        });
    }
    else {
        res.status(404).end();
    }
})
module.exports = router;
