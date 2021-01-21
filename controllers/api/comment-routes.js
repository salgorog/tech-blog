const router = require('express').Router();
const { Comment, User, Post } = require('../../models');
const withAuth = require('../../utils/auth');

router.get('/', (req,res) => {
    Comment.findAll({
        attributes: ['comment_text'],
        include: [{
            model: User,
            attributes: ['username']
        },
       {
            model: Post,
            attributes: ['title']
        }]
    })
    .then(dbCommentData=>{
        res.json(dbCommentData);
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json(err);
    });
})

router.post('/', withAuth, (req,res)=>{
    Comment.create({
        comment_text: req.body.comment_text,
        user_id: req.body.user_id,
        post_id: req.body.post_id
    })
    .then(dbCommentData=>{
        res.json(dbCommentData);
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({message: 'Please login to place a comment'});
    })
    
});

router.delete('/:id', withAuth, (req,res) => {
    Comment.destroy({
        where: {
            id: req.params.id
        }
    })
    .then(dbCommentData=>{
        if(!dbCommentData) {
            res.status(404).json({message: 'No comment found with that id'});
            return;
        }
        res.json(dbCommentData);
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json(err);
    });
})

module.exports = router;