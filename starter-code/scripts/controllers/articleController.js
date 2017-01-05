(function(module) {
  var articlesController = {};

  Article.createTable();

  articlesController.index = function(ctx, next) {
    articleView.index(ctx.articles);
  };

  // COMMENT: What does this method do?  What is it's execution path? It's in the middleware chain for /articles/:id. It gets
  //called before articlesController.index. Finds an article by
  //the params id and sets it to the context object as ctx.articles
  //This method loads by the id
  articlesController.loadById = function(ctx, next) {
    var articleData = function(article) {
      ctx.articles = article;
      next();
    };

    Article.findWhere('id', ctx.params.id, articleData);
  };

  // COMMENT: What does this method do?  What is it's execution path?
  //This is in the middleware chain for /author/:authorName. It gets called before
  //articlesController.index. It finds an article by the params author in a SQL database and replaces
  //the query substring with the name of the author, and sets it to the context object as ctx.articles. This method then loads by the author and is
  //rendered to the page by next().

  articlesController.loadByAuthor = function(ctx, next) {
    var authorData = function(articlesByAuthor) {
      ctx.articles = articlesByAuthor;
      next();
    };

    Article.findWhere(
      'author', ctx.params.authorName.replace('+', ' '), authorData
    );
  };

  // COMMENT: What does this method do?  What is it's execution path?
  //This is in the middleware chain for /category/:categoryName. It gets called before
  //articlesController.index. It finds an article by the params category in a SQL database and replaces
  //the query substring with the name of the category, and sets it to the context object as ctx.articles. This method then loads by category and is
  //rendered to the page by next().

  articlesController.loadByCategory = function(ctx, next) {
    var categoryData = function(articlesInCategory) {
      ctx.articles = articlesInCategory;
      next();
    };

    Article.findWhere('category', ctx.params.categoryName, categoryData);
  };

  // COMMENT: What does this method do?  What is it's execution path?
  //It's in the middleware chain for /articles/. It gets called before articlesController.index.
  //This sets the initial page load context prior to using filters as ctx.articles = Article.all. //Essentially, if there have been changes in the filter clicks or url redirects, this looks to see if //Article.all.length has a truthy value, and if so it set the context ctx.articles to Article.all and //renders it to the page. If not, it will run Article.fetchAll on the argument articleData.
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
