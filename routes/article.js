const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin
const ArticleModel = require('../models/article')

// GET /posts 所有用户或者特定用户的文章页
//   eg: GET /posts?author=xxx
router.get('/create', function (req, res, next) {
  res.render('post')
  // res.send('home')
})

router.get('/', function (req, res, next) {
  const author = req.query.author
  ArticleModel.getArticles(author)
    .then(function (articles) {
      res.render('articles', {
        articles
      })
    })
    .catch(next)
})

router.get('/:articleId', function (req, res, next) {
  const articleId = req.params.articleId
  Promise.all([
    ArticleModel.getArticleById(articleId),
    ArticleModel.incPv(articleId),
  ])
    .then(function (result) {
      console.log(result, 'getAritcleById');
      const article = result[0]
      if(!article) {
        throw new Error('该文章不存在')
      }
      res.render('components/article-content', {
        article
      })
    })
    .catch(next)
})

// POST /posts/create 发表一篇文章
router.post('/create', checkLogin, function (req, res, next) {
  const author = req.session.user._id;
  const title = req.fields.title;
  const content = req.fields.content;
  try {
    if(!title.length) {
      throw new Error('请填写标题')
    }
    if(!content.length) {
      throw new Error('请填写内容')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }
  
  let article = {
    author,
    title,
    content,
  }
  
  ArticleModel.create(article)
    .then(function (result) {
      article = result.ops[0]
      req.flash('success', '发表成功')
      res.redirect(`/article/${article._id}`)
    })
    .catch(next)
})

/*
// GET /posts/create 发表文章页
router.get('/create', checkLogin, function (req, res, next) {
  res.send('发表文章页')
})

// GET /posts/:postId 单独一篇的文章页
router.get('/:postId', function (req, res, next) {
  res.send('文章详情页')
})

// GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit', checkLogin, function (req, res, next) {
  res.send('更新文章页')
})

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function (req, res, next) {
  res.send('更新文章')
})

// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, function (req, res, next) {
  res.send('删除文章')
})*/

module.exports = router
