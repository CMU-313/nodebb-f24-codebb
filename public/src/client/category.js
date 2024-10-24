'use strict'

define('forum/category', [
  'forum/infinitescroll',
  'share',
  'navigator',
  'topicList',
  'sort',
  'categorySelector',
  'hooks',
  'alerts',
  'api'
], function (infinitescroll, share, navigator, topicList, sort, categorySelector, hooks, alerts, api) {
  const Category = {}

  $(window).on('action:ajaxify.start', function (ev, data) {
    if (!String(data.url).startsWith('category/')) {
      navigator.disable()
    }
  })

  Category.init = function () {
    const cid = ajaxify.data.cid

    app.enterRoom('category_' + cid)

    share.addShareHandlers(ajaxify.data.name)

    topicList.init('category', loadTopicsAfter)

    sort.handleSort('categoryTopicSort', 'category/' + ajaxify.data.slug)

    if (!config.usePagination) {
      navigator.init('[component="category/topic"]', ajaxify.data.topic_count, Category.toTop, Category.toBottom)
    } else {
      navigator.disable()
    }

    handleScrollToTopicIndex()

    handleIgnoreWatch(cid)

    handleLoadMoreSubcategories()

    categorySelector.init($('[component="category-selector"]'), {
      privilege: 'find',
      parentCid: ajaxify.data.cid,
      onSelect: function (category) {
        ajaxify.go('/category/' + category.cid)
      }
    })

    handleTopicSearch()

    hooks.fire('action:topics.loaded', { topics: ajaxify.data.topics })
    hooks.fire('action:category.loaded', { cid: ajaxify.data.cid })
  }

  function handleScrollToTopicIndex () {
    let topicIndex = ajaxify.data.topicIndex
    if (topicIndex && utils.isNumber(topicIndex)) {
      topicIndex = Math.max(0, parseInt(topicIndex, 10))
      if (topicIndex && window.location.search.indexOf('page=') === -1) {
        navigator.scrollToElement($('[component="category/topic"][data-index="' + topicIndex + '"]'), true, 0)
      }
    }
  }

  function handleIgnoreWatch (cid) {
    $('[component="category/watching"], [component="category/tracking"], [component="category/ignoring"], [component="category/notwatching"]').on('click', function () {
      const $this = $(this)
      const state = $this.attr('data-state')

      api.put(`/categories/${cid}/watch`, { state }, (err) => {
        if (err) {
          return alerts.error(err)
        }

        $('[component="category/watching/menu"]').toggleClass('hidden', state !== 'watching')
        $('[component="category/watching/check"]').toggleClass('fa-check', state === 'watching')

        $('[component="category/tracking/menu"]').toggleClass('hidden', state !== 'tracking')
        $('[component="category/tracking/check"]').toggleClass('fa-check', state === 'tracking')

        $('[component="category/notwatching/menu"]').toggleClass('hidden', state !== 'notwatching')
        $('[component="category/notwatching/check"]').toggleClass('fa-check', state === 'notwatching')

        $('[component="category/ignoring/menu"]').toggleClass('hidden', state !== 'ignoring')
        $('[component="category/ignoring/check"]').toggleClass('fa-check', state === 'ignoring')

        alerts.success('[[category:' + state + '.message]]')
      })
    })
  }

  function handleLoadMoreSubcategories () {
    $('[component="category/load-more-subcategories"]').on('click', async function () {
      const btn = $(this)
      const { categories: data } = await api.get(`/categories/${ajaxify.data.cid}/children?start=${ajaxify.data.nextSubCategoryStart}`)
      btn.toggleClass('hidden', !data.length || data.length < ajaxify.data.subCategoriesPerPage)
      if (!data.length) {
        return
      }
      app.parseAndTranslate('category', 'children', { children: data }, function (html) {
        html.find('.timeago').timeago()
        $('[component="category/subcategory/container"]').append(html)
        ajaxify.data.nextSubCategoryStart += ajaxify.data.subCategoriesPerPage
        ajaxify.data.subCategoriesLeft -= data.length
        btn.toggleClass('hidden', ajaxify.data.subCategoriesLeft <= 0)
          .translateText('[[category:x-more-categories, ' + ajaxify.data.subCategoriesLeft + ']]')
      })

      return false
    })
  }

  // Search for topics in the category based on the search term.
  function handleTopicSearch () {
    const searchEl = $('[component="topic-search"]')
    const topicEls = $('[component="category/topic"]')

    if (!searchEl.length) {
      return
    }

    searchEl.on('keyup', function () {
      const searchTerm = searchEl.val().toLowerCase()

      topicEls.each(function () {
        const topicEl = $(this)
        const titleEl = topicEl.find('[component="topic/header"] a')
        const title = titleEl.text().toLowerCase()
        const titleMatch = title.indexOf(searchTerm) !== -1
        const contentEl = topicEl.find('[component="topic/hidden-content"]')
        const content = contentEl.text().toLowerCase()
        const contentIdx = content.indexOf(searchTerm)
        const hasMatch = (titleMatch || (contentIdx !== -1))
        const searchContentEl = topicEl.find('[component="topic/search-content"]')

        // Hide topics that don't match the search term in their title or their content
        topicEl.toggleClass('hidden', !hasMatch)

        // Use topic/search-content placeholder to display the 100 character preview around the search term.
        // Only do this if the search is more than 2 characters
        if (contentIdx !== -1 && searchTerm.length >= 2) {
          const start = Math.max(0, contentIdx - 50)
          const end = Math.min(content.length, contentIdx + searchTerm.length + 50)
          const snippet = content.substring(start, end)

          // Make the search term come out bold in the search preview
          const highlightedSnippet = snippet.replace(searchTerm, `<strong>${searchTerm}</strong>`)
          searchContentEl.html(`...${highlightedSnippet}...`)
        } else {
          searchContentEl.html('')
        }
      })

      // Show the alert for no matches if there are no matched topics, otherwise keep it hidden.
      const visibleTopics = topicEls.filter(':not(.hidden)')
      const alertComponent = $('[component="category/topic/no-matches"]')
      if (visibleTopics.length === 0) {
        alertComponent.removeClass('hidden')
        alertComponent.html(`No topics match the search term ${searchTerm}.`)
      } else {
        alertComponent.addClass('hidden')
        alertComponent.html('')
      }
    })
  }

  Category.toTop = function () {
    navigator.scrollTop(0)
  }

  Category.toBottom = async () => {
    const { count } = await api.get(`/categories/${ajaxify.data.category.cid}/count`)
    navigator.scrollBottom(count - 1)
  }

  function loadTopicsAfter (after, direction, callback) {
    callback = callback || function () {}

    hooks.fire('action:topics.loading')
    const params = utils.params()
    infinitescroll.loadMore(`/categories/${ajaxify.data.cid}/topics`, {
      after,
      direction,
      query: params,
      categoryTopicSort: params.sort || config.categoryTopicSort
    }, function (data, done) {
      hooks.fire('action:topics.loaded', { topics: data.topics })
      callback(data, done)
    })
  }

  return Category
})
