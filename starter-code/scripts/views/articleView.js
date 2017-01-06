(function(module) {

  var articleView = {};

  var render = function(article) {
    var template = Handlebars.compile($('#article-template').text());

    article.daysAgo = parseInt((new Date() - new Date(article.publishedOn))/60/60/24/1000);
    article.publishStatus = article.publishedOn ? 'published ' + article.daysAgo + ' days ago' : '(draft)';
    article.body = marked(article.body);

    return template(article);
  };

  // COMMENT done: What does this method do?  What is it's execution path?
  // Does: Prepares the  flexible template for the author name and category. Uses the template to make html list items for each unique author and category. On the condition, it appends those html elements (<li>s) to the target if the target is empty.
  // Path: articleView.populateFilters gets called in the articleView.index function which gets called in the articleController.index function which is called as the last middleware function after every articlesController function in the routes.js file.
  articleView.populateFilters = function() {
    var options, // declaring variable called options
      template = Handlebars.compile($('#option-template').text());// declaring variable called template and assigning it the Handlebars compile function that the #option-template text as the source argument

    // Example of using model method with functional programming, synchronous approach:
    // This method is dependant on info being in the DOM. Only authors of shown articles are loaded.
    options = Article.allAuthors().map(function(author) { return template({val: author}); });
    // calls the allAuthors method on the Article object to get an array of unique author names then we map over that array and at each index the "val" in the handlebars template in the html becomes the author of that index.
    if ($('#author-filter option').length < 2) { // Prevent duplication
      $('#author-filter').append(options);
    };// if the list is empty, append the options variable which stores the <li> for each unique author to html element with the id of author-filter

    // Example of using model method with async, SQL-based approach:
    // This approach is DOM-independent, since it reads from the DB directly.
    Article.allCategories(function(rows) {//.allCategories finds distict categories from the database, and passed the found categories into this callback function within the "rows" argument
      if ($('#category-filter option').length < 2) {// if the list is empty
        $('#category-filter').append(
          rows.map(function(row) { // for each distinct category, the html produced by the template is being returned and appended as a list item to the <ul> category-filter
            return template({val: row.category});
          })
        );
      };
    });
  };

  // COMMENT done: What does this method do?  What is it's execution path?
  // Does: Finds the jquery wrapped DOM node with the id of "filters" and attaches an event handler to listen for a change on a list selection. The event handler declares a resource variable that takes the id of what was selected and removes the '-filter' from the string. The resource variable and the value of the selected element will be displayed in the URL and all whitespace will be replaced with a '+'.
  // Path: .handleFilters is called in the articleView.index function which is called in the articleController.index which is called as the last middleware function after every articlesController function in the routes.js file.
  articleView.handleFilters = function() {
    $('#filters').one('change', 'select', function() {
      var resource = this.id.replace('-filter', '');
      page('/' + resource + '/' + $(this).val().replace(/\W+/g, '+')); // Replace any/all whitespace with a +
    });
  };

  articleView.initNewArticlePage = function() {
    $('#articles').show().siblings().hide();

    $('#export-field').hide();
    $('#article-json').on('focus', function(){
      this.select();
    });

    $('#new-form').on('change', 'input, textarea', articleView.create);
  };

  articleView.create = function() {
    var formArticle;
    $('#articles').empty();

    // Instantiate an article based on what's in the form fields:
    formArticle = new Article({
      title: $('#article-title').val(),
      author: $('#article-author').val(),
      authorUrl: $('#article-author-url').val(),
      category: $('#article-category').val(),
      body: $('#article-body').val(),
      publishedOn: $('#article-published:checked').length ? new Date() : null
    });

    $('#articles').append(render(formArticle));

    $('pre code').each(function(i, block) {
      hljs.highlightBlock(block);
    });

    // Export the new article as JSON, so it's ready to copy/paste into blogArticles.js:
    $('#export-field').show();
    $('#article-json').val(JSON.stringify(article) + ',');
  };

  // COMMENT done: What does this method do?  What is it's execution path?
  // Does: This method only displays content in the article tab.  All existing articles are cleared before the desired articles are displayed. Filters are populated and the url is modified to reflect what is displayed. On the condition that more than one article is rendered, those articles are truncated to only display part of each.
  // Path: articleView.index gets called in the articleController.index function and gets passed ctx.articles as an argument. articleController.index gets called after previous middleware function in the route.js file, which is where is gets the value for ctx.articles from.
  articleView.index = function(articles) {
    $('#articles').show().siblings().hide();// find and show the article tab and hide the other tabs that are its siblings

    $('#articles article').remove(); //clear all existing articles
    articles.forEach(function(a) { //for each article from the refined array of articles passed in as an argument, render it according to the Handlebars template and append it to the article tab
      $('#articles').append(render(a));
    });

    articleView.populateFilters(); //populates the author and category filters
    articleView.handleFilters(); //modifies the url

    // DONE: Replace setTeasers with just the truncation logic, if needed:
    if ($('#articles article').length > 1) { // if more than one article is rendered
      $('.article-body *:nth-of-type(n+2)').hide(); //truncate each article
    }
  };

  articleView.initAdminPage = function() {
    var template = Handlebars.compile($('#author-template').text());

    Article.numWordsByAuthor().forEach(function(stat) {
      $('.author-stats').append(template(stat));
    });

    $('#blog-stats .articles').text(Article.all.length);
    $('#blog-stats .words').text(Article.numWordsAll());
  };

  module.articleView = articleView;
})(window);
