(function(module) {
  var articlesController = {};

  Article.createTable();

  articlesController.index = function(ctx, next) {
    articleView.index(ctx.articles);
  };

  // COMMENT: What does this method do?  What is it's execution path? It's in the middleware chain for /articles/:id. It gets called before articlesController.index by routes.js
  // Finds an article by
  //the params id and sets it to the context object as ctx.articles
  // This method loads articles by the  article id. The route of execution is
  // routes->articlesController.loadById->articlesController.index
  // ->article.index which renders the articles. In this case, the
  // articles matching the id.
  articlesController.loadById = function(ctx, next) {
    var articleData = function(article) {
      ctx.articles = article;
      next();
    };

    Article.findWhere('id', ctx.params.id, articleData);
  };

  // COMMENT: What does this method do?  What is it's execution path?
  // called before articlesController.index by routes.js. Finds an article by
  // the params id (authorName) and sets it to the context object
  // ctx.articles. routes->articlesController.loadById->articlesController.index
  // ->articleView.index which renders the articles. This method loads articles
  // by the authorName. Finally, Article.findWhere executes an SQL query selecting
  // articles on the author=authorName and
  // Replaces blank spaces in name with '+' symbol. ->
  //
  articlesController.loadByAuthor = function(ctx,  next) {
    var authorData = function(articlesByAuthor) {
      ctx.articles = articlesByAuthor;
      next();
    };

    Article.findWhere(
      'author', ctx.params.authorName.replace('+', ' '), authorData
    );
  };

  // COMMENT: What does this method do?  What is it's execution path?
    // called before articlesController.index. The execution path
    // is routes->articlesController.loadByCategory->
    // articleView.index which renders the articles to the page.
    //Finds an article by
    // the params id categoryName and sets it to the context object
    // ctx.articles. This method loads by categoryName.
  articlesController.loadByCategory = function(ctx, next) {
    var categoryData = function(articlesInCategory) {
      ctx.articles = articlesInCategory;
      next();
    };

    Article.findWhere('category', ctx.params.categoryName, categoryData);
  };

  // COMMENT: What does this method do?  What is it's execution path?
  // this method is called before articlesController.index. it loads all
  // the articles to the index page and Sets them to the context object.
  // The execution path is: routes->articlesController.loadAll->
  // ->articleData (which sets articles to the context object) ->
  // articleView.index - Article.all || Article.fetchAll which
  // will load what's already stored from the SQL webDB object or
  // it will make an AJAx call to get data. If another GET is performed,
  // the loadAll function is executed and the articles are rendered.
  articlesController.loadAll = function(ctx, next) {
    var articleData = function(allArticles) {
      ctx.articles = Article.all;
      next();
    };

    if (Article.all.length) {
      ctx.articles = Article.all;
      next();
    } else {
      Article.fetchAll(articleData);
    }
  };

  module.articlesController = articlesController;
})(window);
