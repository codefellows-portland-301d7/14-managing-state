(function(module) {
  var articlesController = {};

  Article.createTable();

  articlesController.index = function(ctx, next) {
    articleView.index(ctx.articles);
  };

  // COMMENT done: What does this method do?  What is it's execution path? It's in the middleware chain for /articles/:id. It gets
  //called before articlesController.index. Finds an article by
  //the params id and sets it to the context object as ctx.articles
  // This method loads by the id
  articlesController.loadById = function(ctx, next) {
    var articleData = function(article) {
      ctx.articles = article;
      next();
    };

    Article.findWhere('id', ctx.params.id, articleData);
  };

  // COMMENT done: What does this method do?  What is it's execution path?
  // Does: It finds an article by the params authorName and sets all the articles with that authorName on the context object as ctx.articles.
  // Path: It's in the middleware chain for /author/:authorName. It gets called before articlesController.index
  // This method loads by the author.
  articlesController.loadByAuthor = function(ctx, next) {
    var authorData = function(articlesByAuthor) {
      ctx.articles = articlesByAuthor;
      next();
    };

    Article.findWhere(
      'author', ctx.params.authorName.replace('+', ' '), authorData // replace replaces the 'author' + 'name' with 'author name'
    );
  };

  // COMMENT done: What does this method do?  What is it's execution path?
  // Does: It finds an article in blogDB in Web SQL by the params category and sets all the articles with the same category on the context object as ctx.articles.
  // Path: It's in the middleware chain for /category/:categoryName. It gets called before articlesController.index
  articlesController.loadByCategory = function(ctx, next) {
    var categoryData = function(articlesInCategory) {
      ctx.articles = articlesInCategory;
      next();
    };

    Article.findWhere('category', ctx.params.categoryName, categoryData);
  };

  // COMMENT: What does this method do?  What is it's execution path?
  // Does: If Article.all is populated it sets the array of article objects to the context object as ctx.articles. Otherwise it will fetch articles in the SQL db and populate Article.all and then set it to the context object.
  // Path: It's in the middleware chain for / and it gets called before articlesController.index
  articlesController.loadAll = function(ctx, next) {
    var articleData = function(allArticles) { // allArticles has to be there??? it's not used...
      ctx.articles = Article.all;
      next();
    };

    if (Article.all.length) { // if there's articles in Article.all
      ctx.articles = Article.all; // the array of article objects is set to the context object as  ctx.articles
      next();
    } else {
      Article.fetchAll(articleData); // fetches all the articles from the db or json file then sets the array of article objects to the context object as ctx.articles
    }
  };

  module.articlesController = articlesController;
})(window);
