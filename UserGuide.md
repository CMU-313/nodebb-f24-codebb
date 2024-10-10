# USER GUIDE FOR NEW FEATURES:

### Endorse Feature:
- To use the endorse you must be logged in as an admin user
- Once logged in as an admin go to a topic and find a post
- On the post click on the upvote button
- Refresh the page and there will be a message next to the timestamp stating 
  that the post has been endorsed by an instructor and there will also be a 
  message when you click on the number of people who voted stating the same
  message
- Removing the upvote and refreshing the page will cause these messages to 
  disappear
- To user test this feature you can try logging in as non-admin users and 
  upvote posts to ensure that the endorsement message is not displayed after
  upovting.  Then login as an admin and upvote the post to ensure it works 
  for admins.  Also try removing the upvote as an admin to make sure the 
  message goes away.  Note that the page must be refreshed after the upvote
  action in order to see changes.

### Search Feature:

Video: 
[Search Demo](public/SearchScreenshot.mov)

- To use the search feature you must be logged in
- Once logged in, navigate to any category (Announcements, General Discussion, Comments, Blog)
- Add at least 2 new topics if there are no topics present.
- Find the search bar next to the New Topic Button in the tool bar.
- Enter a query: type in any keyword found in a topic you created. Only posts with the keyword in it will be displayed.
- If the keyword does not exist in any content or title, a message No topics match the search term \_\_\_ will be displayed.
- If the search query is in the content, a small snippet will show under the topic, with the query term bolded.
- Clicking on results will take you directly to post.
- To user test this feature try searching for a common keyword and ensure
  relevant posts show up. You can also create a new post and search for a term that exists in the post to verify. Search for a word that does not exist and ensure "No topics match the search term" message displays.

#### Search Testing:

- Testing backend changes can be found in [test/categories.js](test/categories.js#L140)
- Added tests to getCategoryTopics tests, which was the only backend function changed, to ensure that each topic has a content field and that the content fields have no html tags.
- Otherwise, no other backend changes were made for Search that can be tested. 
